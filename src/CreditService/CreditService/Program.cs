using CreditService.Data;
using CreditService.Data.Responses;
using CreditService.Domain.Abstractions;
using CreditService.Services;
using CreditService.Services.Abstractions;
using CreditService.Validators;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NSwag;
using NSwag.Generation.Processors.Security;
using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json.Serialization;
using System.Diagnostics;
using System.Threading;
using UserService.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});
builder.Services.AddOpenApiDocument(options =>
{
    options.Title = "CreditService API";
    options.AddSecurity("bearerAuth", new OpenApiSecurityScheme
    {
        Type = OpenApiSecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "JWT Authorization header using the Bearer scheme."
    });
    options.OperationProcessors.Add(new AspNetCoreOperationSecurityScopeProcessor("bearerAuth"));
});
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<ApplyForCreditRequestValidator>();

builder.Services.AddHttpContextAccessor();
builder.Services.Configure<HostOptions>(options =>
{
    options.BackgroundServiceExceptionBehavior = BackgroundServiceExceptionBehavior.Ignore;
});

builder.Services.AddHostedService<CreditPaymentWorker>();

builder.Services.AddDbContext<CreditDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<ICreditService, CreditService.Services.CreditService>();
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<IServiceTokenProvider, ServiceTokenProvider>();

var userServiceUrl = builder.Configuration["Services:UserServiceUrl"]
    ?? throw new ArgumentException("Services:UserServiceUrl cannot be null");

var coreServiceUrl = builder.Configuration["Services:CoreServiceUrl"]
    ?? throw new ArgumentException("Services:CoreServiceUrl cannot be null");


builder.Services.AddHttpClient<IUserServiceClient, UserServiceClient>(client =>
{
    client.BaseAddress = new Uri(userServiceUrl);
});

builder.Services.AddHttpClient<ICoreServiceClient, CoreServiceClient>(client =>
{
    client.BaseAddress = new Uri(coreServiceUrl);
});

var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "black.auth";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "black.api";
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? builder.Configuration["Jwt:SigningKey"]
    ?? throw new ArgumentException("Jwt key is missing");

var signingKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtKey));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = signingKey,
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();
var monitoringServiceUrl = builder.Configuration["Services:MonitoringServiceUrl"];
var monitoringEnabled = !string.IsNullOrWhiteSpace(monitoringServiceUrl);
if (monitoringEnabled)
{
    builder.Services.AddHttpClient("MonitoringService", client =>
    {
        client.BaseAddress = new Uri(monitoringServiceUrl!);
        client.Timeout = TimeSpan.FromSeconds(2);
    });
}

var app = builder.Build();
var requestActivitySource = new ActivitySource("CreditService.Requests");
long totalRequests = 0;
long failedRequests = 0;

app.UseCors("AllowAll");
app.Use(async (context, next) =>
{
    var requestNumber = Interlocked.Increment(ref totalRequests);
    using var activity = requestActivitySource.StartActivity("http.request", ActivityKind.Server);
    var stopwatch = Stopwatch.StartNew();
    activity?.SetTag("http.method", context.Request.Method);
    activity?.SetTag("http.route", context.Request.Path.Value);
    activity?.SetTag("http.trace_id", context.TraceIdentifier);

    var responseStatusCode = (int)HttpStatusCode.InternalServerError;
    var requestFailed = false;
    var errorRate = DateTime.UtcNow.Minute % 2 == 0 ? 0.7 : 0.3;

    try
    {
        if (Random.Shared.NextDouble() < errorRate)
        {
            requestFailed = true;
            Interlocked.Increment(ref failedRequests);
            responseStatusCode = (int)HttpStatusCode.InternalServerError;
            context.Response.StatusCode = responseStatusCode;
            context.Response.ContentType = "application/problem+json";
            await context.Response.WriteAsJsonAsync(new
            {
                title = "Simulated instability",
                status = responseStatusCode,
                detail = "Request failed due to simulated service instability.",
                traceId = context.TraceIdentifier
            });
            return;
        }

        await next();
        responseStatusCode = context.Response.StatusCode;
        if (responseStatusCode >= 500)
        {
            requestFailed = true;
            Interlocked.Increment(ref failedRequests);
        }
    }
    catch
    {
        requestFailed = true;
        Interlocked.Increment(ref failedRequests);
        throw;
    }
    finally
    {
        stopwatch.Stop();
        var errorCount = Volatile.Read(ref failedRequests);
        var totalCount = Volatile.Read(ref totalRequests);
        var errorPercentage = totalCount == 0 ? 0 : (double)errorCount / totalCount * 100;
        if (requestFailed)
        {
            activity?.SetStatus(ActivityStatusCode.Error);
        }

        activity?.SetTag("http.status_code", responseStatusCode);
        activity?.SetTag("request.duration_ms", stopwatch.Elapsed.TotalMilliseconds);
        activity?.SetTag("request.error_percentage", errorPercentage);

        app.Logger.LogInformation(
            "Request #{RequestNumber} {Method} {Path} finished with {StatusCode} in {DurationMs} ms. Errors: {ErrorCount}/{TotalCount} ({ErrorPercentage:F2}%). TraceId: {TraceId}",
            requestNumber,
            context.Request.Method,
            context.Request.Path.Value,
            responseStatusCode,
            stopwatch.Elapsed.TotalMilliseconds,
            errorCount,
            totalCount,
            errorPercentage,
            context.TraceIdentifier);

        if (monitoringEnabled)
        {
            try
            {
                var httpClientFactory = context.RequestServices.GetService<IHttpClientFactory>();
                if (httpClientFactory is not null)
                {
                    var monitoringClient = httpClientFactory.CreateClient("MonitoringService");
                    await monitoringClient.PostAsJsonAsync("/api/monitoring/logs", new
                    {
                        ServiceName = "CreditService",
                        Method = context.Request.Method,
                        Path = context.Request.Path.Value ?? string.Empty,
                        StatusCode = responseStatusCode,
                        DurationMs = stopwatch.Elapsed.TotalMilliseconds,
                        ErrorPercentage = errorPercentage,
                        TraceId = context.TraceIdentifier,
                        IsError = requestFailed,
                        CreatedAtUtc = DateTime.UtcNow
                    });
                }
            }
            catch (Exception ex)
            {
                app.Logger.LogWarning(ex, "Failed to send telemetry to MonitoringService.");
            }
        }
    }
});

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;

        if (exception is null)
        {
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            return;
        }

        var (statusCode, title) = exception switch
        {
            ArgumentException => ((int)HttpStatusCode.BadRequest, "Некорректные данные запроса"),
            InvalidOperationException => ((int)HttpStatusCode.Conflict, exception.Message),
            ForbiddenException => ((int)HttpStatusCode.Forbidden, "Доступ запрещен"),
            KeyNotFoundException => ((int)HttpStatusCode.NotFound, "Ресурс не найден"),
            UnauthorizedAccessException => ((int)HttpStatusCode.Unauthorized, "Доступ запрещён"),
            HttpRequestException httpEx when httpEx.StatusCode.HasValue => ((int)httpEx.StatusCode.Value, httpEx.Message),
            HttpRequestException => ((int)HttpStatusCode.BadGateway, "Внешний сервис недоступен"),
            _ => ((int)HttpStatusCode.InternalServerError, "Внутренняя ошибка сервера")
        };

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        await context.Response.WriteAsJsonAsync(new
        {
            title,
            status = statusCode,
            detail = exception.Message,
            traceId = context.TraceIdentifier
        });
    });
});

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<CreditDbContext>();

    dbContext.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();

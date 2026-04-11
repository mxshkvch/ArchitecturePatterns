using CoreService.Abstractions;
using CoreService.Data;
using CoreService.DTOs;
using CoreService.Entities;
using CoreService.Enums;
using CoreService.Hubs;
using CoreService.Services;
using CoreService.Services.Realtime;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Net;
using System.Text;
using System.Text.Json.Serialization;
using CoreService.Configurations;
using RabbitMQ.Client;
using CoreService.Abstractions.Realtime;
using CoreService.Validators;
using FluentValidation;
using FluentValidation.AspNetCore;
using NSwag;
using NSwag.Generation.Processors.Security;
using Polly;
using Polly.Extensions.Http;
using System.Diagnostics;
using System.Net.Http.Json;
using System.Threading;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options => { options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()); });
builder.Services.AddSignalR();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy
            .SetIsOriginAllowed(_ => true)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});
builder.Services.AddOpenApiDocument(options =>
{
    options.Title = "CoreService API";
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
builder.Services.AddValidatorsFromAssemblyContaining<TransferRequestValidator>();

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "black.auth";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "black.api";
byte[] key = Encoding.ASCII.GetBytes(builder.Configuration["Jwt:Key"] ?? throw new ArgumentException("Jwt:Key cannot be null"));

builder.Services.AddAuthentication(x =>
    {
        x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(x =>
    {
        x.RequireHttpsMetadata = false;
        x.SaveToken = true;
        x.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/operations"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
        x.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddHttpContextAccessor();
var monitoringServiceUrl = builder.Configuration["Services:MonitoringServiceUrl"];
var monitoringEnabled = !string.IsNullOrWhiteSpace(monitoringServiceUrl);
if (monitoringEnabled)
{
    builder.Services.AddHttpClient("MonitoringService", client =>
    {
        client.BaseAddress = new Uri(monitoringServiceUrl!);
        client.Timeout = TimeSpan.FromSeconds(2);
    })
        .AddPolicyHandler(GetRetryPolicy())
        .AddPolicyHandler(GetCircuitBreakerPolicy());
}

builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<ICreditService, CreditService>();
builder.Services.Configure<FirebasePushOptions>(builder.Configuration.GetSection("FirebasePush"));
builder.Services.AddSingleton<IFirebasePushNotificationService, FirebasePushNotificationService>();
builder.Services.AddSingleton<IOperationNotificationService, OperationNotificationService>();
builder.Services.AddMemoryCache();
builder.Services.Configure<ExchangeRateOptions>(builder.Configuration.GetSection("ExchangeRates"));
builder.Services.AddHttpClient<IExchangeRateService, ExchangeRateService>((serviceProvider, client) =>
{
    var options = serviceProvider.GetRequiredService<Microsoft.Extensions.Options.IOptions<ExchangeRateOptions>>().Value;
    client.BaseAddress = new Uri(options.BaseUrl);
})
    .AddPolicyHandler(GetRetryPolicy())
    .AddPolicyHandler(GetCircuitBreakerPolicy());
builder.Services.AddScoped<IAccountOperationPublisher, RabbitMqAccountOperationPublisher>();
builder.Services.AddScoped<IAccountOperationProcessor, AccountOperationProcessor>();
builder.Services.AddHostedService<RabbitMqAccountOperationWorker>();

builder.Services.Configure<RabbitMqOptions>(builder.Configuration.GetSection("RabbitMq"));
builder.Services.AddSingleton<IConnection>(_ =>
{
    var options = builder.Configuration.GetSection("RabbitMq").Get<RabbitMqOptions>() ?? new RabbitMqOptions();
    var factory = new ConnectionFactory
    {
        HostName = options.HostName,
        Port = options.Port,
        UserName = options.UserName,
        Password = options.Password,
        AutomaticRecoveryEnabled = true,
        TopologyRecoveryEnabled = true
    };

    return factory.CreateConnectionAsync().GetAwaiter().GetResult();
});

var app = builder.Build();
var requestActivitySource = new ActivitySource("CoreService.Requests");
long totalRequests = 0;
long failedRequests = 0;

app.UseRouting();
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
                        ServiceName = "CoreService",
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
            ValidationException => ((int)HttpStatusCode.BadRequest, "Validation failed"),
            ArgumentException => ((int)HttpStatusCode.BadRequest, "Invalid request"),
            InvalidOperationException => ((int)HttpStatusCode.Conflict, "Operation conflict"),
            ForbiddenException => ((int)HttpStatusCode.Forbidden, "Access denied"),
            KeyNotFoundException => ((int)HttpStatusCode.NotFound, "Resource not found"),
            UnauthorizedAccessException => ((int)HttpStatusCode.Unauthorized, "Unauthorized"),
            HttpRequestException httpEx when httpEx.StatusCode.HasValue => ((int)httpEx.StatusCode.Value, "Dependency failure"),
            HttpRequestException => ((int)HttpStatusCode.BadGateway, "Dependency unavailable"),
            _ => ((int)HttpStatusCode.InternalServerError, "Internal server error")
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

//app.UseExceptionHandler(errorApp =>
//{
//    errorApp.Run(async context =>
//    {
//        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;

//        if (exception is null)
//        {
//            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
//            return;
//        }

//        var (statusCode, title) = exception switch
//        {
//            ArgumentException => ((int)HttpStatusCode.BadRequest, "Некорректные данные запроса"),
//            InvalidOperationException => ((int)HttpStatusCode.Conflict, "Конфликт данных"),
//            ForbiddenException => ((int)HttpStatusCode.Forbidden, "Доступ запрещен"),
//            KeyNotFoundException => ((int)HttpStatusCode.NotFound, "Ресурс не найден"),
//            UnauthorizedAccessException => ((int)HttpStatusCode.Unauthorized, "Доступ запрещён"),
//            HttpRequestException httpEx when httpEx.StatusCode.HasValue => ((int)httpEx.StatusCode.Value, "Ошибка внешнего сервиса"),
//            HttpRequestException => ((int)HttpStatusCode.BadGateway, "Внешний сервис недоступен"),
//            _ => ((int)HttpStatusCode.InternalServerError, "Внутренняя ошибка сервера")
//        };

//        context.Response.Clear();
//        context.Response.StatusCode = statusCode;
//        context.Response.ContentType = "application/problem+json";

//        await context.Response.WriteAsJsonAsync(new
//        {
//            title,
//            status = statusCode,
//            detail = exception.Message,
//            traceId = context.TraceIdentifier
//        });
//    });
//});

//app.UseCors();

if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHub<OperationsHub>("/hubs/operations");

Guid MASTER_ACCOUNT = Guid.Parse("99999999-9999-9999-9999-999999999999");

using (var scopeMaster = app.Services.CreateScope())
{
    IAccountService accountService = scopeMaster.ServiceProvider.GetRequiredService<IAccountService>();

    var dbMaster = scopeMaster.ServiceProvider.GetRequiredService<AppDbContext>();

    dbMaster.Database.Migrate();

    if (!dbMaster.Accounts.Any(u => u.Id == MASTER_ACCOUNT))
    {
        var masterAccount = new Account
        {
            Id = MASTER_ACCOUNT,
            AccountNumber = accountService.GenerateAccountNumber(),
            Status = AccountStatus.ACTIVE,
            Balance = 1000000,//million,
            Currency = Currency.RUB,
            CreatedAt = DateTime.UtcNow,
            ClosedAt = null,
            UserId = MASTER_ACCOUNT//этот же айди у админа должен быть. Админ должен иметь доступ к мастер аккаунту
        };

        dbMaster.Accounts.Add(masterAccount);
        dbMaster.SaveChanges();
    }

}

var scope = app.Services.CreateScope();



var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

db.Database.Migrate();

await app.RunAsync();

static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromMilliseconds(200 * retryAttempt));
}

static IAsyncPolicy<HttpResponseMessage> GetCircuitBreakerPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .AdvancedCircuitBreakerAsync(
            failureThreshold: 0.7,
            samplingDuration: TimeSpan.FromSeconds(30),
            minimumThroughput: 10,
            durationOfBreak: TimeSpan.FromSeconds(30));
}

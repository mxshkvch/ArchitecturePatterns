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
using System.Text;
using System.Text.Json.Serialization;
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

var app = builder.Build();

app.UseCors("AllowAll");

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

    // Создать базу данных, если не существует
    dbContext.Database.EnsureCreated();
    // или если используете миграции:
    // dbContext.Database.Migrate();
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

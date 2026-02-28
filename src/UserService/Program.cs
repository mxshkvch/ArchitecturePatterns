using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Net;
using System.Text;
using System.Text.Json.Serialization;
using UserService.Contracts.Common.Abstractions;
using UserService.Contracts.Responses;
using UserService.Data;
using UserService.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddHttpContextAccessor();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Введите только JWT токен (без префикса Bearer)"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddDbContext<UserDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHttpClient<IAuthServiceClient, AuthServiceClient>(client =>
{
    client.BaseAddress = new Uri("http://localhost:5001"); // адрес AuthService
});

builder.Services.AddScoped<IUserManagementService, UserManagementService>();

var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "black.auth";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "black.api";
var jwtKey = builder.Configuration["Jwt:Key"]
    ?? builder.Configuration["Jwt:SigningKey"]
    ?? "JTD1EH4cfUatNJhTcqhiCdimMTMtK46W3XNEEORDfJl";

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
        x.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = false,
            ValidateAudience = false
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.Use(async (context, next) =>
{
    try
    {
        await next();
    }
    catch (Exception exception)
    {
        var (statusCode, title) = exception switch
        {
            ArgumentException => ((int)HttpStatusCode.BadRequest, "Некорректные данные запроса\nexception.Message"),
            InvalidOperationException => ((int)HttpStatusCode.Conflict, "Конфликт данных\nexception.Message"),
            ForbiddenException => ((int)HttpStatusCode.Forbidden, "Доступ запрещен\n{exception.Message}"),
            KeyNotFoundException => ((int)HttpStatusCode.NotFound, "Ресурс не найден\nexception.Message"),
            UnauthorizedAccessException => ((int)HttpStatusCode.Unauthorized, "Доступ запрещён\nexception.Message"),
            HttpRequestException httpEx when httpEx.StatusCode.HasValue => ((int)httpEx.StatusCode.Value, "Ошибка внешнего сервиса\nexception.Message"),
            HttpRequestException => ((int)HttpStatusCode.BadGateway, "Внешний сервис недоступен\nexception.Message"),
            _ => ((int)HttpStatusCode.BadRequest, "Ошибка обработки запроса\nexception.Message")
        };

        if (!context.Response.HasStarted)
        {
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
        }
    }
});

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();

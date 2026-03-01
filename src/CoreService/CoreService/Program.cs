using CoreService.Abstractions;
using CoreService.Data;
using CoreService.DTOs;
using CoreService.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Net;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options => { options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()); });

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

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
builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<ICreditService, CreditService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .WithOrigins("http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors();

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
            InvalidOperationException => ((int)HttpStatusCode.Conflict, "Конфликт данных"),
            ForbiddenException => ((int)HttpStatusCode.Forbidden, "Доступ запрещен"),
            KeyNotFoundException => ((int)HttpStatusCode.NotFound, "Ресурс не найден"),
            UnauthorizedAccessException => ((int)HttpStatusCode.Unauthorized, "Доступ запрещён"),
            HttpRequestException httpEx when httpEx.StatusCode.HasValue => ((int)httpEx.StatusCode.Value, "Ошибка внешнего сервиса"),
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

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

await app.RunAsync();

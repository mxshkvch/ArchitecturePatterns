using CoreService.Abstractions;
using CoreService.Data;
using CoreService.DTOs;
using CoreService.Entities;
using CoreService.Enums;
using CoreService.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Net;
using System.Text;
using System.Text.Json.Serialization;
using CoreService.Configurations;
using RabbitMQ.Client;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options => { options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()); });

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("DefaultConnection")
    ));

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

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

builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<ICreditService, CreditService>();
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

app.UseRouting();


app.UseCors();

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

//app.UseSwagger();
//app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

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

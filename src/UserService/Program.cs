using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Net;
using System.Text;
using System.Text.Json.Serialization;
using NSwag;
using NSwag.Generation.Processors.Security;
using UserService.Contracts.Common.Abstractions;
using UserService.Contracts.Responses;
using UserService.Data;
using UserService.Services;

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
    options.Title = "UserService API";
    options.AddSecurity("bearerAuth", new OpenApiSecurityScheme
    {
        Type = OpenApiSecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "JWT Authorization header using the Bearer scheme."
    });
    options.OperationProcessors.Add(new AspNetCoreOperationSecurityScopeProcessor("bearerAuth"));
});

builder.Services.AddHttpContextAccessor();

builder.Services.AddDbContext<UserDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IUserManagementService, UserManagementService>();

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
            ValidAudience = jwtAudience
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

if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

Guid MASTER_ACCOUNT = Guid.Parse("99999999-9999-9999-9999-999999999999");

using (var scope = app.Services.CreateScope())
{

    var db = scope.ServiceProvider.GetRequiredService<UserDbContext>();

    db.Database.Migrate();

    if (!db.Users.Any(u => u.Role == UserService.Domain.Enums.UserRole.ADMIN))
    {
        var admin = new UserService.Domain.User
        {
            Id = MASTER_ACCOUNT,
            Email = "admin@system.local",
            PasswordHash = string.Empty,
            FirstName = "System",
            LastName = "Administrator",
            Phone = null,
            Role = UserService.Domain.Enums.UserRole.ADMIN,
            Status = UserService.Domain.Enums.UserStatus.ACTIVE,
            CreatedAt = DateTimeOffset.UtcNow
        };

        db.Users.Add(admin);
        db.SaveChanges();
    }

}

app.Run();

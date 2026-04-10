using System.Net;
using System.Text;
using System.Text.Json.Serialization;
using AuthService.Abstractions;
using AuthService.Data;
using AuthService.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using NSwag;
using NSwag.Generation.Processors.Security;
using Polly;
using Polly.Extensions.Http;

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
    options.Title = "AuthService API";
    options.AddSecurity("bearerAuth", new OpenApiSecurityScheme
    {
        Type = OpenApiSecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "JWT Authorization header using the Bearer scheme."
    });
    options.OperationProcessors.Add(new AspNetCoreOperationSecurityScopeProcessor("bearerAuth"));
});

builder.Services.AddDbContext<AuthDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var userServiceUrl = builder.Configuration["Services:UserServiceUrl"]
    ?? throw new ArgumentException("Services:UserServiceUrl cannot be null");

builder.Services.AddHttpClient<IUserDirectoryClient, UserDirectoryClient>(client =>
{
    client.BaseAddress = new Uri(userServiceUrl);
})
    .AddPolicyHandler(GetRetryPolicy())
    .AddPolicyHandler(GetCircuitBreakerPolicy());

var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "black.auth";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "black.api";
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new ArgumentException("Jwt:Key cannot be null");
var signingKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtKey));

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
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
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IAuthService, AuthService.Services.AuthService>();

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

        var statusCode = exception switch
        {
            ArgumentException => (int)HttpStatusCode.BadRequest,
            InvalidOperationException => (int)HttpStatusCode.Conflict,
            UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
            HttpRequestException httpEx when httpEx.StatusCode.HasValue => (int)httpEx.StatusCode.Value,
            HttpRequestException => (int)HttpStatusCode.BadGateway,
            _ => (int)HttpStatusCode.InternalServerError
        };

        context.Response.Clear();
        context.Response.StatusCode = statusCode;
        context.Response.ContentType = "application/problem+json";

        await context.Response.WriteAsJsonAsync(new
        {
            title = "Request failed",
            status = statusCode,
            detail = exception.Message,
            traceId = context.TraceIdentifier
        });
    });
});

app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
    var userDirectoryClient = scope.ServiceProvider.GetRequiredService<IUserDirectoryClient>();
    dbContext.Database.Migrate();

    var MASTER_ACCOUNT = Guid.Parse("99999999-9999-9999-9999-999999999999");

    if (!dbContext.Users.Any(u => u.Role == AuthService.Enums.UserRole.ADMIN))
    {
        var admin = new AuthService.Entities.User
        {
            Id = MASTER_ACCOUNT,
            Email = "admin@system.local",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Role = AuthService.Enums.UserRole.ADMIN,
            Status = AuthService.Enums.UserStatus.ACTIVE,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.Users.Add(admin);
        dbContext.SaveChanges();

        var profileRequest = new AuthService.DTOs.Requests.CreateUserProfileRequest
        {
            UserId = admin.Id,
            Email = admin.Email,
            Role = admin.Role,
            FirstName = "System",
            LastName = "Administrator",
            Phone = null
        };

        var serviceToken = GenerateSeedServiceToken();
        userDirectoryClient.CreateUserProfileAsync(profileRequest, serviceToken, CancellationToken.None).Wait();
    }
}

string GenerateSeedServiceToken()
{
    var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new ArgumentException("Jwt:Key cannot be null");
    var key = Encoding.ASCII.GetBytes(jwtKey);
    var issuer = builder.Configuration["Jwt:Issuer"] ?? "black.auth";
    var audience = builder.Configuration["Jwt:Audience"] ?? "black.api";

    var claims = new List<System.Security.Claims.Claim>
    {
        new(System.Security.Claims.ClaimTypes.NameIdentifier, "auth-service"),
        new(System.Security.Claims.ClaimTypes.Email, "auth-service"),
        new(System.Security.Claims.ClaimTypes.Role, "SERVICE")
    };

    var tokenDescriptor = new Microsoft.IdentityModel.Tokens.SecurityTokenDescriptor
    {
        Subject = new System.Security.Claims.ClaimsIdentity(claims),
        Expires = DateTime.UtcNow.AddMinutes(10),
        Issuer = issuer,
        Audience = audience,
        SigningCredentials = new Microsoft.IdentityModel.Tokens.SigningCredentials(
            new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key),
            Microsoft.IdentityModel.Tokens.SecurityAlgorithms.HmacSha256Signature)
    };

    var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
    return tokenHandler.WriteToken(tokenHandler.CreateToken(tokenDescriptor));
}

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

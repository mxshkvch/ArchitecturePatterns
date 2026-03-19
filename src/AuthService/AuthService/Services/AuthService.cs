using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AuthService.Abstractions;
using AuthService.Data;
using AuthService.DTOs.Requests;
using AuthService.DTOs.Responses;
using AuthService.Entities;
using AuthService.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace AuthService.Services;

public sealed class AuthService(
    AuthDbContext context,
    IConfiguration configuration,
    IUserDirectoryClient userDirectoryClient) : IAuthService
{
    public async Task<string> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        if (user.Status != UserStatus.ACTIVE)
        {
            throw new UnauthorizedAccessException("User is not active");
        }

        return GenerateAccessToken(user.Id.ToString(), user.Email, user.Role.ToString(), TimeSpan.FromHours(2));
    }

    public async Task<RegisterResponse> RegisterClientAsync(RegisterClientRequest request, CancellationToken cancellationToken)
    {
        var createUserRequest = new CreateUserRequest
        {
            Email = request.Email,
            Password = request.Password,
            Role = UserRole.CLIENT,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone
        };

        return await CreateUserAsync(createUserRequest, cancellationToken);
    }

    public async Task<RegisterResponse> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken)
    {
        var existingUser = await context.Users.AnyAsync(u => u.Email == request.Email, cancellationToken);
        if (existingUser)
        {
            throw new InvalidOperationException("Email already registered");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role,
            Status = UserStatus.ACTIVE,
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(user);
        await context.SaveChangesAsync(cancellationToken);

        var serviceToken = GenerateAccessToken("auth-service", "auth-service", "SERVICE", TimeSpan.FromMinutes(10));

        var profileRequest = new CreateUserProfileRequest
        {
            UserId = user.Id,
            Email = user.Email,
            Role = user.Role,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone
        };

        await userDirectoryClient.CreateUserProfileAsync(profileRequest, serviceToken, cancellationToken);

        return new RegisterResponse
        {
            UserId = user.Id,
            AccessToken = GenerateAccessToken(user.Id.ToString(), user.Email, user.Role.ToString(), TimeSpan.FromHours(2)),
            RefreshToken = Guid.NewGuid().ToString("N")
        };
    }

    public async Task<TokenResponse> IssueTokenAsync(TokenRequest request, CancellationToken cancellationToken)
    {
        if (string.Equals(request.GrantType, "password", StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                throw new UnauthorizedAccessException("Username and password are required");
            }

            var loginToken = await LoginAsync(new LoginRequest
            {
                Email = request.Username,
                Password = request.Password
            }, cancellationToken);

            return new TokenResponse
            {
                AccessToken = loginToken,
                ExpiresIn = 7200
            };
        }

        if (string.Equals(request.GrantType, "client_credentials", StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(request.ClientId) || string.IsNullOrWhiteSpace(request.ClientSecret))
            {
                throw new UnauthorizedAccessException("Client credentials are required");
            }

            var clients = configuration.GetSection("OAuth:Clients").Get<List<OAuthClientRequest>>() ?? [];
            var client = clients.FirstOrDefault(x =>
                x.ClientId == request.ClientId &&
                x.ClientSecret == request.ClientSecret);

            if (client == null)
            {
                throw new UnauthorizedAccessException("Invalid client credentials");
            }

            return new TokenResponse
            {
                AccessToken = GenerateAccessToken(client.ClientId, client.ClientId, client.Role, TimeSpan.FromMinutes(30)),
                ExpiresIn = 1800
            };
        }

        throw new UnauthorizedAccessException("Unsupported grant_type");
    }

    private string GenerateAccessToken(string subject, string email, string role, TimeSpan lifetime)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var jwtKey = configuration["Jwt:Key"] ?? throw new ArgumentException("Jwt:Key cannot be null");
        var key = Encoding.ASCII.GetBytes(jwtKey);
        var issuer = configuration["Jwt:Issuer"] ?? "black.auth";
        var audience = configuration["Jwt:Audience"] ?? "black.api";

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, subject),
            new(ClaimTypes.Email, email),
            new(ClaimTypes.Role, role)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.Add(lifetime),
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}

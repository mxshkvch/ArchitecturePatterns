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

        if (string.Equals(request.GrantType, "authorization_code", StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(request.Code) ||
                string.IsNullOrWhiteSpace(request.ClientId) ||
                string.IsNullOrWhiteSpace(request.RedirectUri))
            {
                throw new UnauthorizedAccessException("code, client_id and redirect_uri are required");
            }

            var authCode = await context.AuthorizationCodes
                .FirstOrDefaultAsync(a => a.Code == request.Code, cancellationToken);

            if (authCode == null)
            {
                throw new UnauthorizedAccessException("Invalid authorization code");
            }

            if (authCode.IsUsed)
            {
                throw new UnauthorizedAccessException("Authorization code has already been used");
            }

            if (authCode.ExpiresAt < DateTime.UtcNow)
            {
                throw new UnauthorizedAccessException("Authorization code has expired");
            }

            if (authCode.ClientId != request.ClientId)
            {
                throw new UnauthorizedAccessException("client_id does not match");
            }

            if (authCode.RedirectUri != request.RedirectUri)
            {
                throw new UnauthorizedAccessException("redirect_uri does not match");
            }

            authCode.IsUsed = true;
            await context.SaveChangesAsync(cancellationToken);

            var user = await context.Users.FindAsync(new object[] { authCode.UserId }, cancellationToken)
                ?? throw new UnauthorizedAccessException("User not found");

            if (user.Status != UserStatus.ACTIVE)
            {
                throw new UnauthorizedAccessException("User is not active");
            }

            return new TokenResponse
            {
                AccessToken = GenerateAccessToken(user.Id.ToString(), user.Email, user.Role.ToString(), TimeSpan.FromHours(2)),
                ExpiresIn = 7200
            };
        }

        throw new UnauthorizedAccessException("Unsupported grant_type");
    }

    public async Task<AuthorizeResponse> AuthorizeAsync(AuthorizeRequest request, CancellationToken cancellationToken)
    {
        var clients = configuration.GetSection("OAuth:Clients").Get<List<OAuthClientRequest>>() ?? [];
        var client = clients.FirstOrDefault(x => x.ClientId == request.ClientId);

        if (client == null)
        {
            throw new ArgumentException("Invalid client_id");
        }

        if (!client.RedirectUris.Contains(request.RedirectUri))
        {
            throw new ArgumentException("Invalid redirect_uri");
        }

        var user = await context.Users.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        if (user.Status != UserStatus.ACTIVE)
        {
            throw new UnauthorizedAccessException("User is not active");
        }

        var code = Guid.NewGuid().ToString("N");

        var authCode = new AuthorizationCode
        {
            Code = code,
            ClientId = request.ClientId,
            UserId = user.Id,
            RedirectUri = request.RedirectUri,
            Scope = request.Scope,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        };

        context.AuthorizationCodes.Add(authCode);
        await context.SaveChangesAsync(cancellationToken);

        return new AuthorizeResponse
        {
            Code = code,
            State = request.State,
            RedirectUri = request.RedirectUri
        };
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

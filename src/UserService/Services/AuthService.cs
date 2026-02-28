using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using UserService.Contracts.Common.Abstractions;
using UserService.Contracts.Requests;
using UserService.Contracts.Responses;
using UserService.Data;
using UserService.Domain;
using UserService.Domain.Enums;

namespace UserService.Services;

public sealed class AuthService(
    UserDbContext dbContext,
    IConfiguration configuration) : IAuthService
{
    public async Task<string> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.FirstOrDefaultAsync(u => u.Email == request.Email, cancellationToken);
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAccessException("Invalid credentials");
        }

        if (user.Status != UserStatus.ACTIVE)
        {
            throw new UnauthorizedAccessException("User is not active");
        }

        return GenerateAccessToken(user);
    }

    public async Task<RegisterResponse> RegisterClientAsync(RegisterClientRequest request, CancellationToken cancellationToken)
    {
        bool existingUser = await dbContext.Users.AnyAsync(u => u.Email == request.Email, cancellationToken);
        if (existingUser)
        {
            throw new InvalidOperationException("Email already registered");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FirstName = string.Empty,
            LastName = string.Empty,
            Phone = null,
            Role = UserRole.CLIENT,
            Status = UserStatus.ACTIVE,
            CreatedAt = DateTimeOffset.UtcNow
        };

        dbContext.Users.Add(user);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new RegisterResponse
        {
            UserId = user.Id,
            AccessToken = GenerateAccessToken(user),
            RefreshToken = Guid.NewGuid().ToString("N")
        };
    }

    private string GenerateAccessToken(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        string jwtKey = configuration["Jwt:Key"] ?? throw new ArgumentException("Jwt:Key cannot be null");
        byte[] key = Encoding.ASCII.GetBytes(jwtKey);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            }),
            Expires = DateTime.UtcNow.AddHours(2),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}

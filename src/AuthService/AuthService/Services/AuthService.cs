using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AuthService.Abstractions;
using AuthService.Data;
using AuthService.DTos.Requests;
using AuthService.DTOs.Requests;
using AuthService.DTOs.Responses;
using AuthService.Entities;
using AuthService.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace AuthService.Services;

public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;
    private readonly AuthDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public AuthService(AuthDbContext context, IConfiguration configuration, ICurrentUserService currentUserService)
    {
        _context = context;
        _configuration = configuration;
        _currentUserService = currentUserService;
    }

    public async Task<string> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
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

    public async Task<RegisterResponse> RegisterClientAsync(RegisterClientRequest request)
    {
        bool existingUser = await _context.Users.AnyAsync(u => u.Email == request.Email);
        if (existingUser)
        {
            throw new InvalidOperationException("Email already registered");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = UserRole.CLIENT,
            Status = UserStatus.ACTIVE,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        CreateUserAdminRequest createUserRequest = new CreateUserAdminRequest(user.Email, null, null, user.Role, user.PasswordHash, null, user.Id);

        await _currentUserService.CreateUserAsync(createUserRequest);

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
        string jwtKey = _configuration["Jwt:Key"] ?? throw new ArgumentException("Jwt:Key cannot be null");
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

using CoreService.Abstractions;
using CoreService.Data;
using CoreService.DTOs;
using CoreService.DTOs.Requests;
using CoreService.DTOs.Responses;
using CoreService.Entities;
using CoreService.Enums;
using Microsoft.EntityFrameworkCore;

namespace CoreService.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;

    public UserService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResponse<UserResponse>> GetUsersAsync(int page, int size, string? role)
    {
        var query = _context.Users.AsQueryable();

        if (!string.IsNullOrEmpty(role) && Enum.TryParse<UserRole>(role, out var parsedRole))
        {
            query = query.Where(u => u.Role == parsedRole);
        }

        int totalElements = await query.CountAsync();
        var users = await query.Skip(page * size).Take(size).ToListAsync();

        return new PagedResponse<UserResponse>
        {
            Content = users.Select(MapToResponse).ToList(),
            Page = new PageInfo
            {
                Page = page,
                Size = size,
                TotalElements = totalElements,
                TotalPages = (int)Math.Ceiling(totalElements / (double)size)
            }
        };
    }

    public async Task<UserResponse> CreateUserAdminAsync(CreateUserAdminRequest request)
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
            FirstName = request.FirstName,
            LastName = request.LastName,
            Phone = request.Phone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role,
            Status = UserStatus.ACTIVE,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return MapToResponse(user);
    }

    public async Task<UserResponse> UpdateUserStatusAsync(Guid userId, UpdateUserStatusRequest request)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            throw new InvalidOperationException("User not found");
        }

        user.Status = request.Status;
        await _context.SaveChangesAsync();

        return MapToResponse(user);
    }

    private UserResponse MapToResponse(User user)
    {
        return new UserResponse
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Phone = user.Phone,
            Role = user.Role.ToString(),
            Status = user.Status.ToString(),
            CreatedAt = user.CreatedAt
        };
    }
}
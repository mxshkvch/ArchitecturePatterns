using CoreService.DTOs.Requests;
using CoreService.DTOs.Responses;

namespace CoreService.Abstractions;

public interface IUserService
{
    Task<PagedResponse<UserResponse>> GetUsersAsync(int page, int size, string? role);
    Task<UserResponse> CreateUserAdminAsync(CreateUserAdminRequest request);
    Task<UserResponse> UpdateUserStatusAsync(Guid userId, UpdateUserStatusRequest request);
}
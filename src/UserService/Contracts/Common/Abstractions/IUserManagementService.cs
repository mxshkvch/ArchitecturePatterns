using UserService.Contracts.Requests;
using UserService.Contracts.Responses;

namespace UserService.Contracts.Common.Abstractions
{
    public interface IUserManagementService
    {
        Task<UsersResponse> GetUsersAsync(PagingQuery query, CancellationToken cancellationToken);
        Task<UserResponse> CreateUserAsync(RegisterClientRequest request, CancellationToken cancellationToken);
        Task<UserResponse> UpdateStatusAsync(Guid userId, UpdateUserStatusRequest request, CancellationToken cancellationToken);
    }
}

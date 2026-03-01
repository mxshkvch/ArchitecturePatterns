using AuthService.DTos.Requests;

namespace AuthService.Abstractions;

public interface ICurrentUserService
{
    Guid GetUserId();
    string GetUserRole();
    Task CreateUserAsync(CreateUserAdminRequest request);
}

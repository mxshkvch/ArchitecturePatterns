using AuthService.DTOs.Requests;

namespace AuthService.Abstractions;

public interface IUserDirectoryClient
{
    Task CreateUserProfileAsync(CreateUserProfileRequest request, string bearerToken, CancellationToken cancellationToken);
}

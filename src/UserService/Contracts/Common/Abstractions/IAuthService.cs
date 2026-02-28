using UserService.Contracts.Requests;
using UserService.Contracts.Responses;

namespace UserService.Contracts.Common.Abstractions;

public interface IAuthService
{
    Task<string> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task<RegisterResponse> RegisterClientAsync(RegisterClientRequest request, CancellationToken cancellationToken);
}

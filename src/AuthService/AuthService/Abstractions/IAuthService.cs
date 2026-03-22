using AuthService.DTOs.Requests;
using AuthService.DTOs.Responses;

namespace AuthService.Abstractions;

public interface IAuthService
{
    Task<string> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task<RegisterResponse> RegisterClientAsync(RegisterClientRequest request, CancellationToken cancellationToken);
    Task<RegisterResponse> CreateUserAsync(CreateUserRequest request, CancellationToken cancellationToken);
    Task<TokenResponse> IssueTokenAsync(TokenRequest request, CancellationToken cancellationToken);
    Task<AuthorizeResponse> AuthorizeAsync(AuthorizeRequest request, CancellationToken cancellationToken);
}

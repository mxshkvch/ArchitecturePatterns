using AuthService.DTOs.Requests;

namespace AuthService.Abstractions;

public interface IAuthService
{
    Task<string> LoginAsync(LoginRequest request);
    Task RegisterClientAsync(RegisterClientRequest request);
}

using AuthService.DTOs.Requests;
using AuthService.DTOs.Responses;

namespace AuthService.Abstractions;

public interface IAuthService
{
    Task<string> LoginAsync(LoginRequest request);
    Task<RegisterResponse> RegisterClientAsync(RegisterClientRequest request);
}

using CoreService.DTOs.Requests;

namespace CoreService.Abstractions;

public interface IAuthService
{
    Task<string> LoginAsync(LoginRequest request);
    Task RegisterClientAsync(RegisterClientRequest request);
}
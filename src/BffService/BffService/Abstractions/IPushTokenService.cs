using BffService.DTOs.Requests;
using BffService.DTOs.Responses;

namespace BffService.Abstractions;

public interface IPushTokenService
{
    Task<PushTokenRegistrationResponse> RegisterAsync(Guid userId, RegisterPushTokenRequest request, CancellationToken cancellationToken);
    Task UnregisterAsync(Guid userId, UnregisterPushTokenRequest request, CancellationToken cancellationToken);
}

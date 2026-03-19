using BffService.DTOs.Requests;
using BffService.DTOs.Responses;
using BffService.Enums;

namespace BffService.Abstractions;

public interface IUserSettingsService
{
    Task<UserSettingsResponse> GetAsync(Guid userId, ApplicationType applicationType, CancellationToken cancellationToken);
    Task<UserSettingsResponse> UpsertAsync(Guid userId, UpsertUserSettingsRequest request, CancellationToken cancellationToken);
}

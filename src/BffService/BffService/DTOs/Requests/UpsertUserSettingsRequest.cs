using BffService.Enums;

namespace BffService.DTOs.Requests;

public sealed class UpsertUserSettingsRequest
{
    public ApplicationType ApplicationType { get; set; }
    public ThemeType Theme { get; set; }
    public IReadOnlyCollection<Guid> HiddenAccountIds { get; set; } = Array.Empty<Guid>();
}

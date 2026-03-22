using BffService.Enums;

namespace BffService.DTOs.Responses;

public sealed class UserSettingsResponse
{
    public Guid UserId { get; set; }
    public ApplicationType ApplicationType { get; set; }
    public ThemeType Theme { get; set; }
    public IReadOnlyCollection<Guid> HiddenAccountIds { get; set; } = Array.Empty<Guid>();
    public DateTimeOffset UpdatedAt { get; set; }
}

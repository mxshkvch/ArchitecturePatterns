using BffService.Enums;

namespace BffService.Entities;

public sealed class UserSettings
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public ApplicationType ApplicationType { get; set; }
    public ThemeType Theme { get; set; }
    public string HiddenAccountIdsJson { get; set; } = "[]";
    public DateTimeOffset UpdatedAt { get; set; }
}

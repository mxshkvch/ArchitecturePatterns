using BffService.Enums;

namespace BffService.Entities;

public sealed class PushTokenRegistration
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public ApplicationType ApplicationType { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

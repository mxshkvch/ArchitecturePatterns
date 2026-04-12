using BffService.Enums;

namespace BffService.DTOs.Responses;

public sealed class PushTokenRegistrationResponse
{
    public Guid UserId { get; set; }
    public ApplicationType ApplicationType { get; set; }
    public string Token { get; set; } = string.Empty;
    public string Topic { get; set; } = string.Empty;
    public DateTimeOffset UpdatedAt { get; set; }
}

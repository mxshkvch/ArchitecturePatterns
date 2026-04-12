using BffService.Enums;

namespace BffService.DTOs.Requests;

public sealed class UnregisterPushTokenRequest
{
    public ApplicationType ApplicationType { get; set; }
    public string Token { get; set; } = string.Empty;
}

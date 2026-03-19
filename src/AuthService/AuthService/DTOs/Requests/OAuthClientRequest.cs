namespace AuthService.DTOs.Requests;

public sealed class OAuthClientRequest
{
    public string ClientId { get; set; } = string.Empty;
    public string ClientSecret { get; set; } = string.Empty;
    public string Role { get; set; } = "SERVICE";
}

namespace CreditService.Services;

public sealed class UserAccessResponse
{
    public required Guid Id { get; init; }
    public required string Role { get; init; }
    public required string Status { get; init; }
}

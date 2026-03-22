using UserService.Domain.Enums;

namespace UserService.Contracts.Requests;

public sealed class CreateUserProfileRequest
{
    public Guid UserId { get; set; }
    public string Email { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
}

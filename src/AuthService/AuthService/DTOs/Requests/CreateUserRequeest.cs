using System.ComponentModel.DataAnnotations;
using AuthService.Enums;
namespace AuthService.DTos.Requests;

public sealed record CreateUserRequest(
    Guid id,
    [param: Required, EmailAddress] string Email,
    string? Phone,
    [param: Required] UserRole Role,
    [param: Required, MinLength(8)] string Password);

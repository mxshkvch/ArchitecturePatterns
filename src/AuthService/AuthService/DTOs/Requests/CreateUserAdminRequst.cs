using System.ComponentModel.DataAnnotations;
using AuthService.Enums;
namespace AuthService.DTos.Requests;
public sealed record CreateUserAdminRequest(
    [param: Required, EmailAddress] string Email,
    [param: Required] string FirstName,
    [param: Required] string LastName,
    [param: Required] UserRole Role,
    [param: Required, MinLength(8)] string Password,
    string? Phone,
    Guid? id);
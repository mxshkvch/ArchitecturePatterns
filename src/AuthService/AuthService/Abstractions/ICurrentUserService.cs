namespace AuthService.Abstractions;

public interface ICurrentUserService
{
    Guid GetUserId();
    string GetUserRole();
}

namespace BffService.Abstractions;

public interface ICurrentUserService
{
    Guid GetUserId();
    string GetUserRole();
}

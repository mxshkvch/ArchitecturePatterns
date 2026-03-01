namespace CoreService.Abstractions;

public interface ICurrentUserService
{
    Guid GetUserId();
    string GetUserRole();
}
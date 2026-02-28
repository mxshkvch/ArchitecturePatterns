namespace CreditService.Services.Abstractions;

public interface IUserServiceClient
{
    Task<UserAccessResponse> GetUserAccessAsync(Guid userId, CancellationToken cancellationToken);
}

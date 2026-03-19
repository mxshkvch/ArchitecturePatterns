using System.Net;

namespace CreditService.Services.Abstractions;

public interface IUserServiceClient
{
    Task<UserAccessResponse> GetUserAccessAsync(Guid userId, CancellationToken cancellationToken);
    Task<List<UserAccessResponse>> GetAllUsers(CancellationToken cancellationToken);
    Task<int> ChangeCreditHistory(Guid userId, int amount, CancellationToken cancellationToken);
    Task<int> GetCreditHistory(Guid userId, CancellationToken cancellationToken);
}

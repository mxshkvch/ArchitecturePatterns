namespace CreditService.Services.Abstractions
{
    public interface ICoreServiceClient
    {
        Task<Guid> GetUserAccountAsync(Guid userId, CancellationToken cancellationToken);
        //Task<Guid> PayUserAccountCreditAsync(Guid userId, Guid AccountId, Guid creditId, CancellationToken cancellationToken);
    }
}

namespace CreditService.Services.Abstractions
{
    public interface ICoreServiceClient
    {
        Task<Guid> GetUserAccountAsync(Guid userId, Guid accountId, CancellationToken cancellationToken);
        Task<bool> PayUserAccountCreditAsync(Guid userId, Guid accountId, double paymentAmount, CancellationToken cancellationToken);
        Task<bool> DepostUserAccountAfterApplyAsync(Guid userId, Guid accountId, double paymentAmount, CancellationToken cancellationToken);

        Task AddTransactionPayment(Guid userId, Guid accountId, double paymentAmount, CancellationToken cancellationToken);
    }
}

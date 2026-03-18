using CoreService.DTOs.Requests;
using CoreService.DTOs.Responses;

namespace CoreService.Abstractions;

public interface IAccountService
{
    Task<PagedResponse<AccountResponse>> GetAccountsAsync(Guid userId, int page, int size);
    Task<PagedResponse<AccountResponse>> GetAllAccountsAsync(int page, int size, Guid? userId, string? status);
    Task<AccountResponse> CreateAccountAsync(Guid userId, CreateAccountRequest request);
    Task<AccountResponse> GetAccountAsync(Guid accountId, Guid userId, bool isAdmin);
    Task CloseAccountAsync(Guid accountId, Guid userId, bool isAdmin);
    Task<PagedResponse<TransactionResponse>> GetTransactionsAsync(Guid accountId, Guid userId, bool isAdmin, int page, int size, DateTime? fromDate, DateTime? toDate);
    Task DepositAsync(Guid accountId, Guid userId, DepositRequest request);
    Task WithdrawAsync(Guid accountId, Guid userId, WithdrawalRequest request);
    Task CreditPaymentAsync(Guid accountId, Guid userId, CreditAutomaticPaymentRequest request);
    Task CreditDepositTransactionAsync(Guid accountId, Guid userId, CreditAutomaticPaymentRequest request);
    Task<AccountResponse> TransferMoney(Guid fromAccountId, Guid toAccountId, decimal amountMoney);
    string GenerateAccountNumber();
}
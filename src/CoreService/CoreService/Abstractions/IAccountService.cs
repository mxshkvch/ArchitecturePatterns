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
}
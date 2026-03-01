using CoreService.Abstractions;
using CoreService.Data;
using CoreService.DTOs;
using CoreService.DTOs.Requests;
using CoreService.DTOs.Responses;
using CoreService.Entities;
using CoreService.Enums;
using Microsoft.EntityFrameworkCore;

namespace CoreService.Services;

public class AccountService : IAccountService
{
    private readonly AppDbContext _context;

    public AccountService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResponse<AccountResponse>> GetAccountsAsync(Guid userId, int page, int size)
    {
        var query = _context.Accounts.Where(a => a.UserId == userId);
        int totalElements = await query.CountAsync();
        var accounts = await query.Skip(page * size).Take(size).ToListAsync();

        return new PagedResponse<AccountResponse>
        {
            Content = accounts.Select(MapToResponse).ToList(),
            Page = new PageInfo
            {
                Page = page,
                Size = size,
                TotalElements = totalElements,
                TotalPages = (int)Math.Ceiling(totalElements / (double)size)
            }
        };
    }

    public async Task<PagedResponse<AccountResponse>> GetAllAccountsAsync(int page, int size, Guid? userId, string? status)
    {
        var query = _context.Accounts.AsQueryable();

        if (userId.HasValue)
        {
            query = query.Where(a => a.UserId == userId.Value);
        }

        if (!string.IsNullOrEmpty(status) && Enum.TryParse<AccountStatus>(status, out var parsedStatus))
        {
            query = query.Where(a => a.Status == parsedStatus);
        }

        int totalElements = await query.CountAsync();
        var accounts = await query.Skip(page * size).Take(size).ToListAsync();

        return new PagedResponse<AccountResponse>
        {
            Content = accounts.Select(MapToResponse).ToList(),
            Page = new PageInfo
            {
                Page = page,
                Size = size,
                TotalElements = totalElements,
                TotalPages = (int)Math.Ceiling(totalElements / (double)size)
            }
        };
    }

    public async Task<AccountResponse> CreateAccountAsync(Guid userId, CreateAccountRequest request)
    {
        var account = new Account
        {
            Id = Guid.NewGuid(),
            AccountNumber = GenerateAccountNumber(),
            UserId = userId,
            Balance = request.InitialDeposit,
            Currency = request.Currency,
            Status = AccountStatus.ACTIVE,
            CreatedAt = DateTime.UtcNow
        };

        _context.Accounts.Add(account);

        if (request.InitialDeposit > 0)
        {
            var transaction = new Transaction
            {
                Id = Guid.NewGuid(),
                AccountId = account.Id,
                Type = TransactionType.DEPOSIT,
                Amount = request.InitialDeposit,
                Description = "Initial deposit",
                Timestamp = DateTime.UtcNow,
                BalanceAfter = request.InitialDeposit
            };
            _context.Transactions.Add(transaction);
        }

        await _context.SaveChangesAsync();
        return MapToResponse(account);
    }

    public async Task<AccountResponse> GetAccountAsync(Guid accountId, Guid userId, bool isAdmin)
    {
        var account = await _context.Accounts.FindAsync(accountId);
        if (account == null || (!isAdmin && account.UserId != userId))
        {
            throw new InvalidOperationException("Account not found or access denied");
        }

        return MapToResponse(account);
    }

    public async Task CloseAccountAsync(Guid accountId, Guid userId, bool isAdmin)
    {
        var account = await _context.Accounts.FindAsync(accountId);
        if (account == null || (!isAdmin && account.UserId != userId))
        {
            throw new InvalidOperationException("Account not found or access denied");
        }

        if (account.Balance != 0)
        {
            throw new InvalidOperationException("Cannot close account with non-zero balance");
        }

        account.Status = AccountStatus.CLOSED;
        account.ClosedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
    }

    public async Task<PagedResponse<TransactionResponse>> GetTransactionsAsync(Guid accountId, Guid userId, bool isAdmin, int page, int size, DateTime? fromDate, DateTime? toDate)
    {
        var account = await _context.Accounts.FindAsync(accountId);
        if (account == null || (!isAdmin && account.UserId != userId))
        {
            throw new InvalidOperationException("Account not found or access denied");
        }

        var query = _context.Transactions.Where(t => t.AccountId == accountId);

        if (fromDate.HasValue)
        {
            query = query.Where(t => t.Timestamp >= fromDate.Value);
        }

        if (toDate.HasValue)
        {
            query = query.Where(t => t.Timestamp <= toDate.Value);
        }

        int totalElements = await query.CountAsync();
        var transactions = await query.OrderByDescending(t => t.Timestamp).Skip(page * size).Take(size).ToListAsync();

        return new PagedResponse<TransactionResponse>
        {
            Content = transactions.Select(MapToResponse).ToList(),
            Page = new PageInfo
            {
                Page = page,
                Size = size,
                TotalElements = totalElements,
                TotalPages = (int)Math.Ceiling(totalElements / (double)size)
            }
        };
    }

    public async Task DepositAsync(Guid accountId, Guid userId, DepositRequest request)
    {
        var account = await _context.Accounts.FindAsync(accountId);
        if (account == null || account.UserId != userId)
        {
            throw new InvalidOperationException("Account not found or access denied");
        }

        if (account.Status != AccountStatus.ACTIVE)
        {
            throw new InvalidOperationException("Account is not active");
        }

        account.Balance += request.Amount;

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            Type = TransactionType.DEPOSIT,
            Amount = request.Amount,
            Description = request.Description,
            Timestamp = DateTime.UtcNow,
            BalanceAfter = account.Balance
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();
    }

    public async Task WithdrawAsync(Guid accountId, Guid userId, WithdrawalRequest request)
    {
        var account = await _context.Accounts.FindAsync(accountId);
        if (account == null || account.UserId != userId)
        {
            throw new InvalidOperationException("Account not found or access denied");
        }

        if (account.Status != AccountStatus.ACTIVE)
        {
            throw new InvalidOperationException("Account is not active");
        }

        if (account.Balance < request.Amount)
        {
            throw new InvalidOperationException("Insufficient funds");
        }

        account.Balance -= request.Amount;

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            Type = TransactionType.WITHDRAWAL,
            Amount = request.Amount,
            Description = request.Description,
            Timestamp = DateTime.UtcNow,
            BalanceAfter = account.Balance
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();
    }

    private string GenerateAccountNumber()
    {
        var random = new Random();
        return string.Join("", Enumerable.Range(0, 20).Select(_ => random.Next(0, 10).ToString()));
    }

    private AccountResponse MapToResponse(Account account)
    {
        return new AccountResponse
        {
            Id = account.Id,
            AccountNumber = account.AccountNumber,
            UserId = account.UserId,
            Balance = account.Balance,
            Currency = account.Currency.ToString(),
            Status = account.Status.ToString(),
            CreatedAt = account.CreatedAt,
            ClosedAt = account.ClosedAt
        };
    }

    private TransactionResponse MapToResponse(Transaction transaction)
    {
        return new TransactionResponse
        {
            Id = transaction.Id,
            AccountId = transaction.AccountId,
            Type = transaction.Type.ToString(),
            Amount = transaction.Amount,
            Description = transaction.Description,
            Timestamp = transaction.Timestamp,
            BalanceAfter = transaction.BalanceAfter
        };
    }
}
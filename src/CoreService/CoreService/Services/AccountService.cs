using CoreService.Abstractions;
using CoreService.Data;
using CoreService.DTOs;
using CoreService.DTOs.Requests;
using CoreService.DTOs.Responses;
using CoreService.Entities;
using CoreService.Enums;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Security.Principal;

namespace CoreService.Services;

public class AccountService : IAccountService
{
    private readonly AppDbContext _context;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ICurrentUserService _userServiceClient;

    public AccountService(AppDbContext context, IHttpContextAccessor httpContextAccessor, ICurrentUserService userServiceClient)
    {
        _context = context;
        _httpContextAccessor = httpContextAccessor;
        _userServiceClient = userServiceClient;
        Guid MASTER_ACCOUNT = Guid.Parse("99999999-9999-9999-9999-999999999999");
    }

    public async Task<AccountResponse> TransferMoney(Guid fromAccountId, Guid toAccountId, decimal amountMoney)
    {
        //fromAccount ќЅя«ј“≈Ћ№Ќќ должен принадлежать текущему юзеру

        //возвращаетс€ ответ счета с которого списываютс€ деньги
        //хватает ли средств
        //существуют ли счета
        //не забыть про транзакцию
        //проверить статус счета
        //провер€ю пока со счета на счет одного и того же человека - должно работать при переводе на любой другой счет



        Account? fromAccount = _context.Accounts.Where(a => a.Id == fromAccountId).FirstOrDefault();
        Account? toAccount = _context.Accounts.Where(a => a.Id == toAccountId).FirstOrDefault();

        if (fromAccount == null)
        {
            throw new InvalidOperationException("fromAccount not found");
        }

        Guid currentUser = _userServiceClient.GetUserId();

        if (currentUser == Guid.Empty)
        {
            throw new UnauthorizedAccessException("Not authorized");
        }

        if (fromAccount.UserId != currentUser)
        {
            throw new InvalidOperationException($"user = {currentUser} does not own account = {fromAccountId}");
        }

        if (toAccount == null)
        {
            throw new InvalidOperationException("toAccount not found");
        }

        if (fromAccount.Balance < amountMoney)
        {
            throw new InvalidOperationException($"Balance on fromAccount ({fromAccount}) is lower than amountMoney = {amountMoney}");
        }

        if (fromAccount.Status != AccountStatus.ACTIVE)
        {
            throw new InvalidOperationException($"fromAccount = {fromAccount} is not active");
        }

        if (toAccount.Status != AccountStatus.ACTIVE)
        {
            throw new InvalidOperationException($"toAccount = {toAccount} is not active");
        }

        //уменьшить у фром и увеличить у to

        fromAccount.Balance -= amountMoney;
        toAccount.Balance += amountMoney;

        _context.Accounts.UpdateRange( fromAccount, toAccount );

        //две транзакции

        Transaction fromTransaction = new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = fromAccountId,
            Type = TransactionType.TRANSFER,
            Amount = amountMoney,
            Description = $"Transfer to {toAccountId}",
            Timestamp = DateTime.UtcNow,
            BalanceAfter = fromAccount.Balance
        };

        Transaction toTransaction = new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = toAccountId,
            Type = TransactionType.TRANSFER,
            Amount = amountMoney,
            Description = $"Transfer from {fromAccountId}",
            Timestamp = DateTime.UtcNow,
            BalanceAfter = toAccount.Balance
        };

        _context.Transactions.AddRange(fromTransaction, toTransaction);
        await _context.SaveChangesAsync();

        AccountResponse accountResponse = new AccountResponse
        {
            AccountNumber = fromAccount.AccountNumber,
            ClosedAt = fromAccount.ClosedAt,
            CreatedAt = fromAccount.CreatedAt,
            Status = fromAccount.Status.ToString(),
            Balance = fromAccount.Balance,
            Currency = fromAccount.Currency.ToString(),
            Id = fromAccount.Id,
            UserId = fromAccount.UserId
        };

        return accountResponse;
    }

    public async Task<AccountResponse> TransferMoneyFromMasterAccount(Guid masterAccountId, Guid toAccountId, string description, decimal amountMoney)
    {
        //fromAccount ќЅя«ј“≈Ћ№Ќќ должен принадлежать текущему юзеру
        //если masterAccount то только в том случае если равно его особому счету
        //возвращаетс€ ответ счета с которого списываютс€ деньги
        //хватает ли средств
        //существуют ли счета
        //не забыть про транзакцию
        //проверить статус счета
        //провер€ю пока со счета на счет одного и того же человека - должно работать при переводе на любой другой счет
        
        Account? masterAccount = _context.Accounts.Where(a => a.Id == masterAccountId).FirstOrDefault();
        Account? toAccount = _context.Accounts.Where(a => a.Id == toAccountId).FirstOrDefault();

        if (masterAccount == null)
        {
            throw new InvalidOperationException("masterAccount not found");
        }

        if (toAccount == null)
        {
            throw new InvalidOperationException("toAccount not found");
        }


        Guid currentUser = toAccount.UserId;

        if (currentUser == Guid.Empty)
        {
            throw new UnauthorizedAccessException("Not authorized");
        }

        //if (masterAccount.UserId == currentUser)
        //{
        //    throw new InvalidOperationException($"user is admin = {currentUser} he owns masterAccount = {masterAccountId}");
        //}

        if (toAccount.UserId != currentUser)
        {
            throw new InvalidOperationException($"{currentUser} do not own toAccount.id = {toAccount.Id}");
        }


        if (masterAccount.Status != AccountStatus.ACTIVE)
        {
            throw new InvalidOperationException($"fromAccount = {masterAccount} is not active");
        }

        if (toAccount.Status != AccountStatus.ACTIVE)
        {
            throw new InvalidOperationException($"toAccount = {toAccount} is not active");
        }


        //description UserTakesCredit or UserPaysCredit

        switch (description)
        {
            case "UserTakesCredit":

                if (masterAccount.Balance < amountMoney)
                {
                    throw new InvalidOperationException($"Balance on masterAccount ({masterAccount}) is lower than amountMoney = {amountMoney}");
                }

                masterAccount.Balance -= amountMoney;
                toAccount.Balance += amountMoney;

                break;
            case "UserPaysCredit":

                if (toAccount.Balance < amountMoney)
                {
                    throw new InvalidOperationException($"Balance on toAccount ({toAccount}) is lower than amountMoney = {amountMoney}");
                }

                masterAccount.Balance += amountMoney;
                toAccount.Balance -= amountMoney;

                break;
        }
        //toAccountId - это то, что принадлежит юзеру



        //уменьшить у фром и увеличить у to

        _context.Accounts.UpdateRange(masterAccount, toAccount);

        //две транзакции

        Transaction masterTransaction = new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = masterAccountId,
            Amount = amountMoney,
            Timestamp = DateTime.UtcNow,
            BalanceAfter = masterAccount.Balance
        };

        Transaction toTransaction = new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = toAccountId,
            Amount = amountMoney,
            Timestamp = DateTime.UtcNow,
            BalanceAfter = toAccount.Balance
        };

        switch (description)
        {
            case "UserTakesCredit":

                masterTransaction.Type = TransactionType.CREDIT_GIVE;
                masterTransaction.Description = $"Credit is given to {toAccountId}";

                toTransaction.Type = TransactionType.CREDIT_RECEIPT;
                toTransaction.Description = $"Credit is taken from {masterAccountId}";

                break;
            case "UserPaysCredit":

                masterTransaction.Type = TransactionType.CREDIT_RECEIPT;
                masterTransaction.Description = $"User's account = {toAccountId} paid";

                toTransaction.Type = TransactionType.CREDIT_PAYMENT;
                toTransaction.Description = $"Pay to master account = {masterAccountId}";

                break;
        }

        _context.Transactions.AddRange(masterTransaction, toTransaction);
        await _context.SaveChangesAsync();

        AccountResponse accountResponse = new AccountResponse
        {
            AccountNumber = toAccount.AccountNumber,
            ClosedAt = toAccount.ClosedAt,
            CreatedAt = toAccount.CreatedAt,
            Status = toAccount.Status.ToString(),
            Balance = toAccount.Balance,
            Currency = toAccount.Currency.ToString(),
            Id = toAccount.Id,
            UserId = toAccount.UserId
        };

        return accountResponse;
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

    public async Task CreditPaymentAsync(Guid accountId, Guid userId, CreditAutomaticPaymentRequest request)
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
            Type = TransactionType.CREDIT_PAYMENT,
            Amount = request.Amount,
            Description = request.Description,
            Timestamp = DateTime.UtcNow,
            BalanceAfter = account.Balance
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();
    }

    public async Task CreditDepositTransactionAsync(Guid accountId, Guid userId, CreditAutomaticPaymentRequest request)
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

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            Type = TransactionType.CREDIT_PAYMENT,
            Amount = request.Amount,
            Description = request.Description,
            Timestamp = DateTime.UtcNow,
            BalanceAfter = account.Balance
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();
    }

    public string GenerateAccountNumber()
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
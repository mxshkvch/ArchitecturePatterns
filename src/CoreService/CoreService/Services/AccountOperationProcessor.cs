using System.Data;
using CoreService.Abstractions;
using CoreService.Data;
using CoreService.Entities;
using CoreService.Enums;
using CoreService.Messaging;
using Microsoft.EntityFrameworkCore;

namespace CoreService.Services;

public sealed class AccountOperationProcessor(
    AppDbContext dbContext,
    IExchangeRateService exchangeRateService) : IAccountOperationProcessor
{
    public async Task ProcessAsync(AccountOperationMessage message, CancellationToken cancellationToken)
    {
        if (message.Amount <= 0)
        {
            throw new InvalidOperationException("Amount must be positive");
        }

        await using var transaction = await dbContext.Database.BeginTransactionAsync(IsolationLevel.Serializable, cancellationToken);

        switch (message.OperationType)
        {
            case AccountOperationType.DEPOSIT:
                await ProcessDepositAsync(message, cancellationToken);
                break;
            case AccountOperationType.WITHDRAW:
                await ProcessWithdrawAsync(message, cancellationToken);
                break;
            case AccountOperationType.TRANSFER:
                await ProcessTransferAsync(message, cancellationToken);
                break;
            default:
                throw new InvalidOperationException("Unsupported operation type");
        }

        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);
    }

    private async Task ProcessDepositAsync(AccountOperationMessage message, CancellationToken cancellationToken)
    {
        var account = await dbContext.Accounts
            .SingleOrDefaultAsync(x => x.Id == message.AccountId && x.UserId == message.UserId && x.Status == AccountStatus.ACTIVE, cancellationToken)
            ?? throw new InvalidOperationException("Account not found or access denied");

        account.Balance = Math.Round(account.Balance + message.Amount, 2);

        dbContext.Transactions.Add(new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            Type = TransactionType.DEPOSIT,
            Amount = message.Amount,
            Description = "Deposit",
            Timestamp = DateTime.UtcNow,
            BalanceAfter = account.Balance
        });
    }

    private async Task ProcessWithdrawAsync(AccountOperationMessage message, CancellationToken cancellationToken)
    {
        var account = await dbContext.Accounts
            .SingleOrDefaultAsync(x => x.Id == message.AccountId && x.UserId == message.UserId && x.Status == AccountStatus.ACTIVE, cancellationToken)
            ?? throw new InvalidOperationException("Account not found or access denied");

        if (account.Balance < message.Amount)
        {
            throw new InvalidOperationException("Insufficient funds");
        }

        account.Balance = Math.Round(account.Balance - message.Amount, 2);

        dbContext.Transactions.Add(new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            Type = TransactionType.WITHDRAWAL,
            Amount = message.Amount,
            Description = "Withdrawal",
            Timestamp = DateTime.UtcNow,
            BalanceAfter = account.Balance
        });
    }

    private async Task ProcessTransferAsync(AccountOperationMessage message, CancellationToken cancellationToken)
    {
        if (!message.TargetAccountId.HasValue)
        {
            throw new InvalidOperationException("Target account is required");
        }

        if (message.TargetAccountId.Value == message.AccountId)
        {
            throw new InvalidOperationException("Source and target accounts must differ");
        }

        var fromAccount = await dbContext.Accounts
            .SingleOrDefaultAsync(x => x.Id == message.AccountId && x.UserId == message.UserId && x.Status == AccountStatus.ACTIVE, cancellationToken)
            ?? throw new InvalidOperationException("Source account not found or access denied");

        var toAccount = await dbContext.Accounts
            .SingleOrDefaultAsync(x => x.Id == message.TargetAccountId.Value && x.Status == AccountStatus.ACTIVE, cancellationToken)
            ?? throw new InvalidOperationException("Target account not found");

        if (fromAccount.Balance < message.Amount)
        {
            throw new InvalidOperationException("Insufficient funds");
        }

        var creditAmount = message.Amount;
        if (fromAccount.Currency != toAccount.Currency)
        {
            var rate = await exchangeRateService.GetRateAsync(fromAccount.Currency, toAccount.Currency, cancellationToken);
            creditAmount = Math.Round(message.Amount * rate, 2);
        }

        fromAccount.Balance = Math.Round(fromAccount.Balance - message.Amount, 2);
        toAccount.Balance = Math.Round(toAccount.Balance + creditAmount, 2);

        dbContext.Transactions.AddRange(
            new Transaction
            {
                Id = Guid.NewGuid(),
                AccountId = fromAccount.Id,
                Type = TransactionType.TRANSFER,
                Amount = message.Amount,
                Description = $"Transfer to {toAccount.Id} ({toAccount.Currency})",
                Timestamp = DateTime.UtcNow,
                BalanceAfter = fromAccount.Balance
            },
            new Transaction
            {
                Id = Guid.NewGuid(),
                AccountId = toAccount.Id,
                Type = TransactionType.TRANSFER,
                Amount = creditAmount,
                Description = $"Transfer from {fromAccount.Id} ({fromAccount.Currency})",
                Timestamp = DateTime.UtcNow,
                BalanceAfter = toAccount.Balance
            });
    }
}

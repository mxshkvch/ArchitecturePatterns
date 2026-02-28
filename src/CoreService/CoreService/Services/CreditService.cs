using CoreService.Abstractions;
using CoreService.Data;
using CoreService.DTOs;
using CoreService.DTOs.Requests;
using CoreService.DTOs.Responses;
using CoreService.Entities;
using CoreService.Enums;
using Microsoft.EntityFrameworkCore;

namespace CoreService.Services;

public class CreditService : ICreditService
{
    private readonly AppDbContext _context;

    public CreditService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResponse<CreditTariffResponse>> GetTariffsAsync(int page, int size)
    {
        var query = _context.CreditTariffs.AsQueryable();
        int totalElements = await query.CountAsync();
        var tariffs = await query.Skip(page * size).Take(size).ToListAsync();

        return new PagedResponse<CreditTariffResponse>
        {
            Content = tariffs.Select(MapToResponse).ToList(),
            Page = new PageInfo
            {
                Page = page,
                Size = size,
                TotalElements = totalElements,
                TotalPages = (int)Math.Ceiling(totalElements / (double)size)
            }
        };
    }

    public async Task<CreditTariffResponse> CreateTariffAsync(CreateCreditTariffRequest request)
    {
        var tariff = new CreditTariff
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            InterestRate = request.InterestRate,
            MinAmount = request.MinAmount,
            MaxAmount = request.MaxAmount,
            MinTerm = request.MinTerm,
            MaxTerm = request.MaxTerm,
            Status = TariffStatus.ACTIVE
        };

        _context.CreditTariffs.Add(tariff);
        await _context.SaveChangesAsync();

        return MapToResponse(tariff);
    }

    public async Task<CreditResponse> ApplyForCreditAsync(Guid userId, ApplyForCreditRequest request)
    {
        var tariff = await _context.CreditTariffs.FindAsync(request.TariffId);
        if (tariff == null || tariff.Status != TariffStatus.ACTIVE)
        {
            throw new InvalidOperationException("Tariff not found or inactive");
        }

        if (request.Amount < tariff.MinAmount || request.Amount > tariff.MaxAmount)
        {
            throw new InvalidOperationException("Amount out of bounds");
        }

        if (request.Term < tariff.MinTerm || request.Term > tariff.MaxTerm)
        {
            throw new InvalidOperationException("Term out of bounds");
        }

        var account = new Account
        {
            Id = Guid.NewGuid(),
            AccountNumber = GenerateAccountNumber(),
            UserId = userId,
            Balance = request.Amount,
            Currency = Currency.RUB,
            Status = AccountStatus.ACTIVE,
            CreatedAt = DateTime.UtcNow
        };

        var credit = new Credit
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            AccountId = account.Id,
            TariffId = tariff.Id,
            Principal = request.Amount,
            RemainingAmount = request.Amount + request.Amount * tariff.InterestRate / 100,
            InterestRate = tariff.InterestRate,
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(request.Term),
            Status = CreditStatus.ACTIVE
        };

        _context.Accounts.Add(account);
        _context.Credits.Add(credit);

        var transaction = new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            Type = TransactionType.CREDIT_RECEIPT,
            Amount = request.Amount,
            Description = "Credit disbursement",
            Timestamp = DateTime.UtcNow,
            BalanceAfter = account.Balance
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        return MapToResponse(credit);
    }

    public async Task<PagedResponse<CreditResponse>> GetMyCreditsAsync(Guid userId, int page, int size)
    {
        var query = _context.Credits.Where(c => c.UserId == userId);
        int totalElements = await query.CountAsync();
        var credits = await query.Skip(page * size).Take(size).ToListAsync();

        return new PagedResponse<CreditResponse>
        {
            Content = credits.Select(MapToResponse).ToList(),
            Page = new PageInfo
            {
                Page = page,
                Size = size,
                TotalElements = totalElements,
                TotalPages = (int)Math.Ceiling(totalElements / (double)size)
            }
        };
    }

    public async Task<CreditResponse> GetCreditAsync(Guid creditId, Guid userId, bool isAdmin)
    {
        var credit = await _context.Credits.FindAsync(creditId);
        if (credit == null || (!isAdmin && credit.UserId != userId))
        {
            throw new InvalidOperationException("Credit not found or access denied");
        }

        return MapToResponse(credit);
    }

    public async Task PayCreditAsync(Guid creditId, Guid userId, CreditPaymentRequest request)
    {
        var credit = await _context.Credits.FindAsync(creditId);
        if (credit == null || credit.UserId != userId)
        {
            throw new InvalidOperationException("Credit not found or access denied");
        }

        if (credit.Status == CreditStatus.PAID)
        {
            throw new InvalidOperationException("Credit is already paid");
        }

        var sourceAccount = await _context.Accounts.FindAsync(request.AccountId);
        if (sourceAccount == null || sourceAccount.UserId != userId)
        {
            throw new InvalidOperationException("Source account not found or access denied");
        }

        if (sourceAccount.Balance < request.Amount)
        {
            throw new InvalidOperationException("Insufficient funds in source account");
        }

        sourceAccount.Balance -= request.Amount;
        credit.RemainingAmount -= request.Amount;

        if (credit.RemainingAmount <= 0)
        {
            credit.RemainingAmount = 0;
            credit.Status = CreditStatus.PAID;
        }

        var withdrawalTransaction = new Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = sourceAccount.Id,
            Type = TransactionType.CREDIT_PAYMENT,
            Amount = request.Amount,
            Description = "Credit payment",
            Timestamp = DateTime.UtcNow,
            BalanceAfter = sourceAccount.Balance
        };

        _context.Transactions.Add(withdrawalTransaction);
        await _context.SaveChangesAsync();
    }

    public async Task<PagedResponse<CreditResponse>> GetAllCreditsAsync(int page, int size)
    {
        var query = _context.Credits.AsQueryable();
        int totalElements = await query.CountAsync();
        var credits = await query.Skip(page * size).Take(size).ToListAsync();

        return new PagedResponse<CreditResponse>
        {
            Content = credits.Select(MapToResponse).ToList(),
            Page = new PageInfo
            {
                Page = page,
                Size = size,
                TotalElements = totalElements,
                TotalPages = (int)Math.Ceiling(totalElements / (double)size)
            }
        };
    }

    private string GenerateAccountNumber()
    {
        var random = new Random();
        return string.Join("", Enumerable.Range(0, 20).Select(_ => random.Next(0, 10).ToString()));
    }

    private CreditTariffResponse MapToResponse(CreditTariff tariff)
    {
        return new CreditTariffResponse
        {
            Id = tariff.Id,
            Name = tariff.Name,
            InterestRate = tariff.InterestRate,
            MinAmount = tariff.MinAmount,
            MaxAmount = tariff.MaxAmount,
            MinTerm = tariff.MinTerm,
            MaxTerm = tariff.MaxTerm,
            Status = tariff.Status.ToString()
        };
    }

    private CreditResponse MapToResponse(Credit credit)
    {
        return new CreditResponse
        {
            Id = credit.Id,
            UserId = credit.UserId,
            AccountId = credit.AccountId,
            TariffId = credit.TariffId,
            Principal = credit.Principal,
            RemainingAmount = credit.RemainingAmount,
            InterestRate = credit.InterestRate,
            StartDate = credit.StartDate,
            EndDate = credit.EndDate,
            Status = credit.Status.ToString()
        };
    }
}
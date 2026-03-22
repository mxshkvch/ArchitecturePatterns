using CoreService.Abstractions;
using CoreService.Data;
using CoreService.DTOs.Requests;
using CoreService.DTOs.Responses;
using CoreService.Entities;
using CoreService.Enums;
using CoreService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace CoreService.Controllers;

[ApiController]
[Route("internal/core")]
[Authorize(Roles = "SERVICE")]
public class InternalCoreController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public readonly Guid _FAILED_CORE = Guid.Parse("00000000-000b-0000-0000-000000000000");
    private IAccountService _accountService;
    private readonly Guid MASTER_ACCOUNT = Guid.Parse("99999999-9999-9999-9999-999999999999");
    public InternalCoreController(AppDbContext dbContext, IAccountService accountService)
    {
        _dbContext = dbContext;
        _accountService = accountService;
    }

    [HttpGet("{userId}/account/{accountId}")]
    public async Task<ActionResult<UserAccountResponse>> GetUserAccount(
        Guid userId,
        Guid accountId,
        CancellationToken cancellationToken)
    {
        bool isAccountExists = await _dbContext.Accounts.Where(a => a.UserId == userId && a.Status == 0 && a.Id == accountId).AnyAsync(cancellationToken);

        if (!isAccountExists)
        {
            return NotFound("User's account doesn't exist");
        }

        return Ok(new UserAccountResponse
        {
            AccountId = accountId
        });
    }
    //если не хватает средств, то все равно успешно списывается. FIX!!!!
    [HttpPost("{userId}/account/pay")]
    public async Task<ActionResult<bool>> PayUserAccount(
    Guid userId,
    [FromQuery] Guid accountId,
    [FromQuery] string paymentAmount,
    CancellationToken cancellationToken)
    {
        paymentAmount = paymentAmount.Replace(",", ".");

        if (!double.TryParse(paymentAmount,
            System.Globalization.NumberStyles.Any,
            System.Globalization.CultureInfo.InvariantCulture,
            out double amount))
        {
            return BadRequest("Invalid payment amount");
        }

        amount = Math.Round(amount, 2, MidpointRounding.AwayFromZero);

        var account = await _dbContext.Accounts
            .Where(a => a.UserId == userId && a.Status == 0 && a.Id == accountId)
            .FirstOrDefaultAsync(cancellationToken);

        if (account == null)
        {
            Guid accountIdNew = await _dbContext.Accounts
                .Where(a => a.UserId == userId && a.Status == 0 && a.Balance >= (decimal)amount)
                .Select(a => a.Id)
                .FirstOrDefaultAsync(cancellationToken);

            if (accountIdNew == Guid.Empty)
            {
                return Ok(false);
            }

            var accountNew = await _dbContext.Accounts
                .Where(a => a.UserId == userId && a.Status == 0 && a.Id == accountIdNew)
                .FirstOrDefaultAsync(cancellationToken);

            if (accountNew.Balance < (decimal)amount)
            {
                return Ok(false);
            }

            accountNew.Balance -= (decimal)amount;
            accountNew.Balance = Math.Round(accountNew.Balance, 2);

            _dbContext.Transactions.Add(new CoreService.Entities.Transaction
            {
                Id = Guid.NewGuid(),
                AccountId = accountNew.Id,
                Type = CoreService.Enums.TransactionType.CREDIT_PAYMENT,
                Amount = (decimal)amount,
                Description = "Credit payment",
                Timestamp = DateTime.UtcNow,
                BalanceAfter = accountNew.Balance
            });

            await _dbContext.SaveChangesAsync(cancellationToken);

            return Ok(true);
        }
         
        if ((double)account.Balance < amount)
        {
            _dbContext.Transactions.Add(new Transaction
            {
                Id = Guid.NewGuid(),
                AccountId = account.Id,
                Type = TransactionType.PAYMENT_FAIL,
                Amount = (decimal)amount,
                Description = "Not enough money on balance",
                Timestamp = DateTime.UtcNow,
                BalanceAfter = account.Balance
            });

            await _dbContext.SaveChangesAsync(cancellationToken);

            return BadRequest("Not enough money on balance");
        }

        account.Balance -= (decimal)amount;
        account.Balance = Math.Round(account.Balance, 2);

        _dbContext.Transactions.Add(new CoreService.Entities.Transaction
        {
            Id = Guid.NewGuid(),
            AccountId = account.Id,
            Type = CoreService.Enums.TransactionType.CREDIT_PAYMENT,
            Amount = (decimal)amount,
            Description = "Credit payment",
            Timestamp = DateTime.UtcNow,
            BalanceAfter = account.Balance
        });

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(true);
    }

    //проверить функционал - работает
    //добавить транзакцию
    [HttpPost("{userId}/account/creditDeposit")]
    public async Task<ActionResult<bool>> DepostUserAccountAfterApplyAsync(Guid userId, [FromQuery] Guid accountId,
    [FromQuery] string paymentAmount, CancellationToken cancellationToken)
    {

        paymentAmount = paymentAmount.Replace(",", ".");

        if (!double.TryParse(paymentAmount, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double amount))
        {
            return BadRequest("Invalid payment amount");
        }

        amount = Math.Round(amount, 2, MidpointRounding.AwayFromZero);

        var account = await _dbContext.Accounts
            .Where(a => a.UserId == userId && a.Status == 0 && a.Id == accountId)
            .FirstOrDefaultAsync(cancellationToken);

        if (account == null)
        {
            return NotFound("User's account does not exists");
        }

        account.Balance += (decimal)amount;
        account.Balance = Math.Round(account.Balance, 2);

        await _dbContext.SaveChangesAsync(cancellationToken);

        CreditAutomaticPaymentRequest request = new CreditAutomaticPaymentRequest
        {
            Amount = (decimal)amount,
            Description = "Credit successfuly is taken"
        };

        await _accountService.CreditDepositTransactionAsync(accountId, userId, request);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(true);
    }

    //проверить функционал
    //добавляется но неверно считается.
    [HttpPost("{userId}/account/creditTransaction")]
    public async Task<ActionResult<bool>> AddTransactionCreditPayment(Guid userId, [FromQuery] Guid accountId,
    [FromQuery] string paymentAmount, CancellationToken cancellationToken)
    {
        try
        {
            paymentAmount = paymentAmount.Replace(",", ".");

            if (!double.TryParse(paymentAmount, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double amount))
            {
                return BadRequest("Invalid payment amount");
            }

            amount = Math.Round(amount, 2, MidpointRounding.AwayFromZero);

            var account = await _dbContext.Accounts
                .Where(a => a.UserId == userId && a.Status == 0 && a.Id == accountId)
                .FirstOrDefaultAsync(cancellationToken);


            CreditAutomaticPaymentRequest request = new CreditAutomaticPaymentRequest
            {
                Amount = (decimal)amount,
                Description = "Automatic credit payment"
            };

            await _accountService.CreditPaymentAsync(accountId, userId, request);

            if (account == null)
            {
                return NotFound("User's account does not exists");
            }

            account.Balance = Math.Round(account.Balance, 2);

            await _dbContext.SaveChangesAsync(cancellationToken);

            return Ok(true);
        }
        catch (Exception ex)
        {
            return BadRequest("Error with adding transaction to history");
        }
    }

    //description - либо взятие кредита, либо внесение платы
    //description == UserTakesCredit or UserPaysCredit
    [HttpPost("{userId}/masterAccount/{toAccountId}")]
    public async Task<ActionResult<bool>> MasterAccountTransaction(Guid userId, Guid toAccountId, [FromQuery] string paymentAmount, [FromQuery] string description, CancellationToken cancellationToken)
    {
        try
        {
            paymentAmount = paymentAmount.Replace(",", ".");

            if (!double.TryParse(paymentAmount, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double amount))
            {
                return BadRequest("Invalid payment amount");
            }

            amount = Math.Round(amount, 2, MidpointRounding.AwayFromZero);

            var account = await _dbContext.Accounts
                .Where(a => a.Status == 0 && a.Id == MASTER_ACCOUNT)
                .FirstOrDefaultAsync(cancellationToken);



            CreditAutomaticPaymentRequest request = new CreditAutomaticPaymentRequest
            {
                Amount = (decimal)amount,
                Description = description
            };

            //списание или пополнение
            //внутри обработать UserTakesCredit or UserPaysCredit
            AccountResponse accountResponse = await _accountService.TransferMoneyFromMasterAccount(MASTER_ACCOUNT, toAccountId, request.Description, request.Amount);


            return Ok(true);
        }
        catch (Exception ex)
        {
            return BadRequest("Error with adding transaction to history");
        }
    }
}

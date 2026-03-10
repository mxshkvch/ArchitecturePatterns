using CoreService.Data;
using CoreService.DTOs.Responses;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoreService.Controllers;

[ApiController]
[Route("internal/core")]
public class InternalCoreController : ControllerBase
{
    private readonly AppDbContext _dbContext;

    public readonly Guid _FAILED_CORE = Guid.Parse("00000000-000b-0000-0000-000000000000");

    public InternalCoreController(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [HttpGet("{userId}/account")]
    public async Task<ActionResult<UserAccountResponse>> GetUserAccount(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var accountId = await _dbContext.Accounts
            .Where(a => a.UserId == userId && a.Status == 0)
            .Select(a => a.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (accountId == Guid.Empty)
        {
            return Ok(new UserAccountResponse
            {
                AccountId = _FAILED_CORE
            });
        }

        return Ok(new UserAccountResponse
        {
            AccountId = accountId
        });
    }

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

            await _dbContext.SaveChangesAsync(cancellationToken);

            return Ok(true);
        }

        if ((double)account.Balance < amount)
        {
            return Ok(false);
        }

        account.Balance -= (decimal)amount;
        account.Balance = Math.Round(account.Balance, 2);

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(true);
    }
}
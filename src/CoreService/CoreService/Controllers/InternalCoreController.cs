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
        [FromQuery] double paymentAmount,
        CancellationToken cancellationToken)
    {

        var account = await _dbContext.Accounts.Where(a => a.UserId == userId && a.Status == 0 && a.Id == accountId).FirstOrDefaultAsync(cancellationToken);

        if (account == null)//если счет закрылся - ищем другой счет
        {
            Guid accountIdNew = await _dbContext.Accounts
            .Where(a => a.UserId == userId && a.Status == 0 && a.Balance >= (decimal)paymentAmount)
            .Select(a => a.Id)
            .FirstOrDefaultAsync(cancellationToken);

            if (accountIdNew == Guid.Empty)
            {
                return Ok(false);
            }

            var accountNew = await _dbContext.Accounts.Where(a => a.UserId == userId && a.Status == 0 && a.Id == accountIdNew).FirstOrDefaultAsync(cancellationToken);

            if (account.Balance < (decimal)paymentAmount)
            {
                return Ok(false);//баланс нулевой - значит списываться ничего не будет
            }

            account.Balance -= (decimal)paymentAmount;

            await _dbContext.SaveChangesAsync(cancellationToken);

            return Ok(true);
        }

        if (account.Balance < (decimal)paymentAmount)
        {
            return Ok(false);//баланс нулевой - значит списываться ничего не будет
        }

        account.Balance -= (decimal)paymentAmount;

        await _dbContext.SaveChangesAsync(cancellationToken);

        return Ok(true);
    }
}
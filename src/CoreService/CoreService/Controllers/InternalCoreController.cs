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
            .Where(a => a.UserId == userId)
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
}
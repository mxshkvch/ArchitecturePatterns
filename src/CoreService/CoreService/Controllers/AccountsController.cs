using CoreService.Abstractions;
using CoreService.DTOs.Requests;
using CoreService.Messaging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreService.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public sealed class AccountsController(
    IAccountService accountService,
    ICurrentUserService currentUserService,
    IAccountOperationPublisher accountOperationPublisher) : ControllerBase
{
    [HttpPost("accounts/{fromAccountId}/transfer/{toAccountId}")]
    public async Task<IActionResult> TransferMoney(Guid fromAccountId, Guid toAccountId, [FromBody] TransferRequest transferRequest, CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        if (transferRequest.amountMoney <= 0)
        {
            return BadRequest("Amount must be greater than zero");
        }

        var operation = new AccountOperationMessage
        {
            OperationId = Guid.NewGuid(),
            OperationType = AccountOperationType.TRANSFER,
            UserId = userId,
            AccountId = fromAccountId,
            TargetAccountId = toAccountId,
            Amount = transferRequest.amountMoney,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await accountOperationPublisher.PublishAsync(operation, cancellationToken);

        return Accepted(new { operationId = operation.OperationId });
    }

    [HttpGet("accounts")]
    public async Task<IActionResult> GetAccounts([FromQuery] int page = 0, [FromQuery] int size = 20)
    {
        var userId = currentUserService.GetUserId();
        var response = await accountService.GetAccountsAsync(userId, page, size);
        return Ok(response);
    }

    [HttpPost("accounts")]
    public async Task<IActionResult> CreateAccount([FromBody] CreateAccountRequest request)
    {
        var userId = currentUserService.GetUserId();
        var response = await accountService.CreateAccountAsync(userId, request);
        return StatusCode(201, response);
    }

    [HttpGet("accounts/{accountId}")]
    public async Task<IActionResult> GetAccount(Guid accountId)
    {
        var userId = currentUserService.GetUserId();
        var isAdmin = currentUserService.GetUserRole() is "ADMIN" or "EMPLOYEE";
        var response = await accountService.GetAccountAsync(accountId, userId, isAdmin);
        return Ok(response);
    }

    [HttpDelete("accounts/{accountId}")]
    public async Task<IActionResult> CloseAccount(Guid accountId)
    {
        var userId = currentUserService.GetUserId();
        var isAdmin = currentUserService.GetUserRole() is "ADMIN" or "EMPLOYEE";
        await accountService.CloseAccountAsync(accountId, userId, isAdmin);
        return NoContent();
    }

    [HttpGet("accounts/{accountId}/transactions")]
    public async Task<IActionResult> GetTransactions(Guid accountId, [FromQuery] int page = 0, [FromQuery] int size = 20, [FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
    {
        var userId = currentUserService.GetUserId();
        var isAdmin = currentUserService.GetUserRole() is "ADMIN" or "EMPLOYEE";
        var response = await accountService.GetTransactionsAsync(accountId, userId, isAdmin, page, size, fromDate, toDate);
        return Ok(response);
    }

    [HttpPost("accounts/{accountId}/deposit")]
    public async Task<IActionResult> Deposit(Guid accountId, [FromBody] DepositRequest request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        if (request.Amount <= 0)
        {
            return BadRequest("Amount must be greater than zero");
        }

        var operation = new AccountOperationMessage
        {
            OperationId = Guid.NewGuid(),
            OperationType = AccountOperationType.DEPOSIT,
            UserId = userId,
            AccountId = accountId,
            Amount = request.Amount,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await accountOperationPublisher.PublishAsync(operation, cancellationToken);

        return Accepted(new { operationId = operation.OperationId });
    }

    [HttpPost("accounts/{accountId}/withdraw")]
    public async Task<IActionResult> Withdraw(Guid accountId, [FromBody] WithdrawalRequest request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        if (request.Amount <= 0)
        {
            return BadRequest("Amount must be greater than zero");
        }

        var operation = new AccountOperationMessage
        {
            OperationId = Guid.NewGuid(),
            OperationType = AccountOperationType.WITHDRAW,
            UserId = userId,
            AccountId = accountId,
            Amount = request.Amount,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await accountOperationPublisher.PublishAsync(operation, cancellationToken);

        return Accepted(new { operationId = operation.OperationId });
    }

    [HttpGet("admin/accounts")]
    [Authorize(Roles = "ADMIN,EMPLOYEE")]
    public async Task<IActionResult> GetAllAccounts([FromQuery] int page = 0, [FromQuery] int size = 20, [FromQuery] Guid? userId = null, [FromQuery] string? status = null)
    {
        var response = await accountService.GetAllAccountsAsync(page, size, userId, status);
        return Ok(response);
    }

    [HttpGet("admin/accounts/{accountId}/transactions")]
    [Authorize(Roles = "ADMIN,EMPLOYEE")]
    public async Task<IActionResult> GetAllTransactions(Guid accountId, [FromQuery] int page = 0, [FromQuery] int size = 20)
    {
        var userId = currentUserService.GetUserId();
        var response = await accountService.GetTransactionsAsync(accountId, userId, true, page, size, null, null);
        return Ok(response);
    }
}

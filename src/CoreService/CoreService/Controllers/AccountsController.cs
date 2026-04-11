using CoreService.Abstractions;
using CoreService.DTOs.Requests;
using CoreService.DTOs.Responses;
using CoreService.Messaging;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Globalization;
using System.Security.Cryptography;
using System.Text;

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

        if (fromAccountId == toAccountId)
        {
            return BadRequest("Source and target accounts must differ");
        }

        try
        {
            await accountService.GetAccountAsync(fromAccountId, userId, false);
        }
        catch (InvalidOperationException)
        {
            return NotFound("Source account not found");
        }

        AccountResponse? toAccountResponse = null;
        try
        {
            toAccountResponse = await accountService.GetAccountAsync(toAccountId, userId, true);
        }
        catch (InvalidOperationException)
        {
            return NotFound("Target account not found");
        }

        var idempotencyKey = GetIdempotencyKey(Request);
        var operation = new AccountOperationMessage
        {
            OperationId = CreateOperationId(
                idempotencyKey,
                "transfer",
                userId.ToString(),
                fromAccountId.ToString(),
                toAccountId.ToString(),
                transferRequest.amountMoney.ToString(CultureInfo.InvariantCulture)),
            OperationType = AccountOperationType.TRANSFER,
            UserId = userId,
            AccountId = fromAccountId,
            TargetAccountId = toAccountId,
            TargetUserId = toAccountResponse?.UserId,
            Amount = transferRequest.amountMoney,
            IdempotencyKey = idempotencyKey,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await accountOperationPublisher.PublishAsync(operation, cancellationToken);

        return Accepted(new { operationId = operation.OperationId, idempotencyKey });
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

        var idempotencyKey = GetIdempotencyKey(Request);
        var operation = new AccountOperationMessage
        {
            OperationId = CreateOperationId(
                idempotencyKey,
                "deposit",
                userId.ToString(),
                accountId.ToString(),
                request.Amount.ToString(CultureInfo.InvariantCulture)),
            OperationType = AccountOperationType.DEPOSIT,
            UserId = userId,
            AccountId = accountId,
            Amount = request.Amount,
            IdempotencyKey = idempotencyKey,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await accountOperationPublisher.PublishAsync(operation, cancellationToken);

        return Accepted(new { operationId = operation.OperationId, idempotencyKey });
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

        var idempotencyKey = GetIdempotencyKey(Request);
        var operation = new AccountOperationMessage
        {
            OperationId = CreateOperationId(
                idempotencyKey,
                "withdraw",
                userId.ToString(),
                accountId.ToString(),
                request.Amount.ToString(CultureInfo.InvariantCulture)),
            OperationType = AccountOperationType.WITHDRAW,
            UserId = userId,
            AccountId = accountId,
            Amount = request.Amount,
            IdempotencyKey = idempotencyKey,
            CreatedAt = DateTimeOffset.UtcNow
        };

        await accountOperationPublisher.PublishAsync(operation, cancellationToken);

        return Accepted(new { operationId = operation.OperationId, idempotencyKey });
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

    private static string? GetIdempotencyKey(HttpRequest request)
    {
        if (request.Headers.TryGetValue("IdempotencyKey", out var keyValues) && !string.IsNullOrWhiteSpace(keyValues))
        {
            return keyValues.ToString().Trim();
        }

        if (request.Headers.TryGetValue("Idempotency-Key", out keyValues) && !string.IsNullOrWhiteSpace(keyValues))
        {
            return keyValues.ToString().Trim();
        }

        return null;
    }

    private static Guid CreateOperationId(string? idempotencyKey, params string[] identityParts)
    {
        if (string.IsNullOrWhiteSpace(idempotencyKey))
        {
            return Guid.NewGuid();
        }

        var payload = $"{string.Join('|', identityParts)}|{idempotencyKey.Trim()}";
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(payload));
        Span<byte> guidBytes = stackalloc byte[16];
        hash.AsSpan(0, 16).CopyTo(guidBytes);

        guidBytes[6] = (byte)((guidBytes[6] & 0x0F) | 0x50);
        guidBytes[8] = (byte)((guidBytes[8] & 0x3F) | 0x80);

        return new Guid(guidBytes);
    }
}

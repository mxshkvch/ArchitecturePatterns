using CoreService.Abstractions;
using CoreService.DTOs.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreService.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class AccountsController : ControllerBase
{
    private readonly IAccountService _accountService;
    private readonly ICurrentUserService _currentUserService;

    public AccountsController(IAccountService accountService, ICurrentUserService currentUserService)
    {
        _accountService = accountService;
        _currentUserService = currentUserService;
    }

    [HttpGet("accounts")]
    public async Task<IActionResult> GetAccounts([FromQuery] int page = 0, [FromQuery] int size = 20)
    {
        var userId = _currentUserService.GetUserId();
        var response = await _accountService.GetAccountsAsync(userId, page, size);
        return Ok(response);
    }

    [HttpPost("accounts")]
    public async Task<IActionResult> CreateAccount([FromBody] CreateAccountRequest request)
    {
        var userId = _currentUserService.GetUserId();
        var response = await _accountService.CreateAccountAsync(userId, request);
        return StatusCode(201, response);
    }

    [HttpGet("accounts/{accountId}")]
    public async Task<IActionResult> GetAccount(Guid accountId)
    {
        var userId = _currentUserService.GetUserId();
        bool isAdmin = _currentUserService.GetUserRole() is "ADMIN" or "EMPLOYEE";
        var response = await _accountService.GetAccountAsync(accountId, userId, isAdmin);
        return Ok(response);
    }

    [HttpDelete("accounts/{accountId}")]
    public async Task<IActionResult> CloseAccount(Guid accountId)
    {
        var userId = _currentUserService.GetUserId();
        bool isAdmin = _currentUserService.GetUserRole() is "ADMIN" or "EMPLOYEE";
        await _accountService.CloseAccountAsync(accountId, userId, isAdmin);
        return NoContent();
    }

    [HttpGet("accounts/{accountId}/transactions")]
    public async Task<IActionResult> GetTransactions(Guid accountId, [FromQuery] int page = 0, [FromQuery] int size = 20, [FromQuery] DateTime? fromDate = null, [FromQuery] DateTime? toDate = null)
    {
        var userId = _currentUserService.GetUserId();
        bool isAdmin = _currentUserService.GetUserRole() is "ADMIN" or "EMPLOYEE";
        var response = await _accountService.GetTransactionsAsync(accountId, userId, isAdmin, page, size, fromDate, toDate);
        return Ok(response);
    }

    [HttpPost("accounts/{accountId}/deposit")]
    public async Task<IActionResult> Deposit(Guid accountId, [FromBody] DepositRequest request)
    {
        var userId = _currentUserService.GetUserId();
        await _accountService.DepositAsync(accountId, userId, request);
        return Ok();
    }

    [HttpPost("accounts/{accountId}/withdraw")]
    public async Task<IActionResult> Withdraw(Guid accountId, [FromBody] WithdrawalRequest request)
    {
        var userId = _currentUserService.GetUserId();
        await _accountService.WithdrawAsync(accountId, userId, request);
        return Ok();
    }

    [HttpGet("admin/accounts")]
    [Authorize(Roles = "ADMIN,EMPLOYEE")]
    public async Task<IActionResult> GetAllAccounts([FromQuery] int page = 0, [FromQuery] int size = 20, [FromQuery] Guid? userId = null, [FromQuery] string? status = null)
    {
        var response = await _accountService.GetAllAccountsAsync(page, size, userId, status);
        return Ok(response);
    }

    [HttpGet("admin/accounts/{accountId}/transactions")]
    [Authorize(Roles = "ADMIN,EMPLOYEE")]
    public async Task<IActionResult> GetAllTransactions(Guid accountId, [FromQuery] int page = 0, [FromQuery] int size = 20)
    {
        var userId = _currentUserService.GetUserId();
        var response = await _accountService.GetTransactionsAsync(accountId, userId, true, page, size, null, null);
        return Ok(response);
    }
}
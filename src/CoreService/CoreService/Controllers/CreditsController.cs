using CoreService.Abstractions;
using CoreService.DTOs.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreService.Controllers;

[ApiController]
[Route("api")]
[Authorize]
public class CreditsController : ControllerBase
{
    private readonly ICreditService _creditService;
    private readonly ICurrentUserService _currentUserService;

    public CreditsController(ICreditService creditService, ICurrentUserService currentUserService)
    {
        _creditService = creditService;
        _currentUserService = currentUserService;
    }

    [HttpGet("credits/tariffs")]
    public async Task<IActionResult> GetTariffs([FromQuery] int page = 0, [FromQuery] int size = 20)
    {
        var response = await _creditService.GetTariffsAsync(page, size);
        return Ok(response);
    }

    [HttpPost("credits/apply")]
    public async Task<IActionResult> ApplyForCredit([FromBody] ApplyForCreditRequest request)
    {
        var userId = _currentUserService.GetUserId();
        var response = await _creditService.ApplyForCreditAsync(userId, request);
        return StatusCode(201, response);
    }

    [HttpGet("credits/my")]
    public async Task<IActionResult> GetMyCredits([FromQuery] int page = 0, [FromQuery] int size = 20)
    {
        var userId = _currentUserService.GetUserId();
        var response = await _creditService.GetMyCreditsAsync(userId, page, size);
        return Ok(response);
    }

    [HttpGet("credits/{creditId}")]
    public async Task<IActionResult> GetCredit(Guid creditId)
    {
        var userId = _currentUserService.GetUserId();
        bool isAdmin = _currentUserService.GetUserRole() is "ADMIN" or "EMPLOYEE";
        var response = await _creditService.GetCreditAsync(creditId, userId, isAdmin);
        return Ok(response);
    }

    [HttpPost("credits/{creditId}/pay")]
    public async Task<IActionResult> PayCredit(Guid creditId, [FromBody] CreditPaymentRequest request)
    {
        var userId = _currentUserService.GetUserId();
        await _creditService.PayCreditAsync(creditId, userId, request);
        return Ok();
    }

    [HttpGet("admin/credits")]
    [Authorize(Roles = "ADMIN,EMPLOYEE")]
    public async Task<IActionResult> GetAllCredits([FromQuery] int page = 0, [FromQuery] int size = 20)
    {
        var response = await _creditService.GetAllCreditsAsync(page, size);
        return Ok(response);
    }

    [HttpPost("admin/credit-tariffs")]
    [Authorize(Roles = "ADMIN,EMPLOYEE")]
    public async Task<IActionResult> CreateCreditTariff([FromBody] CreateCreditTariffRequest request)
    {
        var response = await _creditService.CreateTariffAsync(request);
        return StatusCode(201, response);
    }
}
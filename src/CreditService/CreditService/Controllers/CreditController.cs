using CreditService.Data.Responses;
using CreditService.Domain;
using CreditService.Domain.Abstractions;
using CreditService.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CreditService.Controllers;

[ApiController]
[Route("")]
[Authorize]
public sealed class CreditController(ICreditService creditService) : ControllerBase
{
    [HttpGet("credits/tariffs")]
    public async Task<ActionResult<CreditTariffResponse>> GetAvailableTariffs([FromQuery] int page = 1, [FromQuery] int size = 10)
    {
        var response = await creditService.GetAvailableTarrifs(page, size);
        return Ok(response);
    }

    [HttpPost("credits/apply")]
    public async Task<ActionResult<Credit>> ApplyCredit([FromBody] ApplyForCreditRequest request)
    {
        var credit = await creditService.ApplyCredit(request);
        return CreatedAtAction(nameof(GetCreditById), new { creditId = credit.Id }, credit);
    }

    [HttpGet("credits/my")]
    public async Task<ActionResult<CreditsResponse>> GetMyCredits([FromQuery] int page = 1, [FromQuery] int size = 10)
    {
        var response = await creditService.GetMyCredits(page, size);
        return Ok(response);
    }

    [HttpGet("credits/{creditId:guid}")]
    public async Task<ActionResult<Credit>> GetCreditById([FromRoute] Guid creditId)
    {
        var credit = await creditService.GetCreditById(creditId);
        return Ok(credit);
    }

    [HttpGet("admin/credits")]
    [Authorize(Roles = "ADMIN,EMPLOYEE")]
    public async Task<ActionResult<CreditsResponse>> GetAllCredits([FromQuery] int page = 1, [FromQuery] int size = 10)
    {
        var response = await creditService.GetAllCreditsOfAllUsers(page, size);
        return Ok(response);
    }

    [HttpPost("admin/credit-tariffs")]
    [Authorize(Roles = "ADMIN,EMPLOYEE")]
    public async Task<ActionResult<CreditTariff>> CreateCreditTariff([FromBody] CreateCreditTarrifRequest request)
    {
        var tariff = await creditService.CreateNewTariff(request);
        return CreatedAtAction(nameof(CreateCreditTariff), new { id = tariff.Id }, tariff);
    }
}

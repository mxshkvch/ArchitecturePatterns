using CreditService.Data.Responses;
using CreditService.Domain;
using CreditService.Domain.Abstractions;
using CreditService.Domain.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CreditService.Controllers
{
    [ApiController]
    [Route("")]
    [Authorize]
    public class CreditController : ControllerBase
    {
        private readonly ICreditService _creditService;

        public CreditController(ICreditService creditService)
        {
            _creditService = creditService;
        }

        [HttpGet("credits/tariffs")]
        [AllowAnonymous]
        public async Task<ActionResult<CreditTariffResponse>> GetAvailableTariffs([FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            var response = await _creditService.GetAvailableTarrifs(page, size);
            return Ok(response);
        }

        [HttpPost("credits/apply")]
        public async Task<ActionResult<Credit>> ApplyCredit([FromBody] ApplyForCreditRequest request)
        {
            var credit = await _creditService.ApplyCredit(request);
            return CreatedAtAction(nameof(GetCreditById), new { creditId = credit.Id }, credit);
        }

        [HttpGet("credits/my")]
        public async Task<ActionResult<CreditsResponse>> GetMyCredits([FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            var response = await _creditService.GetMyCredits(page, size);
            return Ok(response);
        }

        [HttpGet("credits/{creditId:guid}")]
        public async Task<ActionResult<Credit>> GetCreditById([FromRoute] Guid creditId)
        {
            var credit = await _creditService.GetCreditById(creditId);
            return Ok(credit);
        }

        [HttpPost("credits/{creditId:guid}/pay")]
        public async Task<IActionResult> PayCredit([FromRoute] Guid creditId, [FromBody] CreditPaymentRequest request)
        {
            await _creditService.PayCreditById(request, creditId);
            return Ok();
        }

        [HttpGet("admin/credits")]
        public async Task<ActionResult<CreditsResponse>> GetAllCredits([FromQuery] int page = 1, [FromQuery] int size = 10)
        {
            var response = await _creditService.GetAllCreditsOfAllUsers(page, size);
            return Ok(response);
        }

        [HttpPost("admin/credit-tariffs")]
        public async Task<ActionResult<CreditTariff>> CreateCreditTariff([FromBody] CreateCreditTarrifRequest request)
        {
            var tariff = await _creditService.CreateNewTariff(request);
            return CreatedAtAction(nameof(CreateCreditTariff), new { id = tariff.Id }, tariff);
        }
    }
}

using BffService.Abstractions;
using BffService.DTOs.Requests;
using BffService.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BffService.Controllers;

[ApiController]
[Route("api/bff/settings")]
[Authorize(Roles = "CLIENT,EMPLOYEE")]
public sealed class UserSettingsController(
    IUserSettingsService userSettingsService,
    ICurrentUserService currentUserService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get([FromQuery] ApplicationType applicationType, CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        var response = await userSettingsService.GetAsync(userId, applicationType, cancellationToken);
        return Ok(response);
    }

    [HttpPut]
    public async Task<IActionResult> Upsert([FromBody] UpsertUserSettingsRequest request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        if (request.ApplicationType == ApplicationType.CLIENT && currentUserService.GetUserRole() != "CLIENT")
        {
            return Forbid();
        }

        if (request.ApplicationType == ApplicationType.EMPLOYEE && currentUserService.GetUserRole() != "EMPLOYEE")
        {
            return Forbid();
        }

        var response = await userSettingsService.UpsertAsync(userId, request, cancellationToken);
        return Ok(response);
    }
}

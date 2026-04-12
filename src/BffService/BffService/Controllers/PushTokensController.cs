using BffService.Abstractions;
using BffService.DTOs.Requests;
using BffService.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BffService.Controllers;

[ApiController]
[Route("api/bff/push-tokens")]
[Authorize(Roles = "CLIENT,EMPLOYEE")]
public sealed class PushTokensController(
    ICurrentUserService currentUserService,
    IPushTokenService pushTokenService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterPushTokenRequest request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        if (!CanManageApplicationType(request.ApplicationType))
        {
            return Forbid();
        }

        var response = await pushTokenService.RegisterAsync(userId, request, cancellationToken);
        return Ok(response);
    }

    [HttpPost("unregister")]
    public async Task<IActionResult> Unregister([FromBody] UnregisterPushTokenRequest request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetUserId();
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        if (!CanManageApplicationType(request.ApplicationType))
        {
            return Forbid();
        }

        await pushTokenService.UnregisterAsync(userId, request, cancellationToken);
        return NoContent();
    }

    private bool CanManageApplicationType(ApplicationType applicationType)
    {
        var role = currentUserService.GetUserRole();
        return applicationType switch
        {
            ApplicationType.CLIENT => role == "CLIENT",
            ApplicationType.EMPLOYEE => role == "EMPLOYEE",
            _ => false
        };
    }
}

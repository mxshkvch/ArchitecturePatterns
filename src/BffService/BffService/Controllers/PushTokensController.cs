using BffService.Abstractions;
using BffService.DTOs.Requests;
using BffService.Exceptions;
using BffService.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BffService.Controllers;

[ApiController]
[Route("api/bff/push-tokens")]
[Authorize(Roles = "CLIENT,EMPLOYEE")]
public sealed class PushTokensController(
    ICurrentUserService currentUserService,
    IPushTokenService pushTokenService,
    ILogger<PushTokensController> logger) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterPushTokenRequest request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetUserId();
        var role = currentUserService.GetUserRole();
        logger.LogInformation(
            "Received push token register request. UserId={UserId}; Role={Role}; ApplicationType={ApplicationType}; TokenSuffix={TokenSuffix}",
            userId,
            role,
            request.ApplicationType,
            GetTokenSuffix(request.Token));
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        if (!CanManageApplicationType(request.ApplicationType))
        {
            return Forbid();
        }

        try
        {
            var response = await pushTokenService.RegisterAsync(userId, request, cancellationToken);
            logger.LogInformation(
                "Push token register request completed. UserId={UserId}; ApplicationType={ApplicationType}; Topic={Topic}; TokenSuffix={TokenSuffix}",
                response.UserId,
                response.ApplicationType,
                response.Topic,
                GetTokenSuffix(response.Token));
            return Ok(response);
        }
        catch (Exception exception) when (IsSubscriptionUnavailableFailure(exception))
        {
            logger.LogError(
                exception,
                "Push token register failed because Firebase subscription is unavailable. UserId={UserId}; ApplicationType={ApplicationType}; TokenSuffix={TokenSuffix}",
                userId,
                request.ApplicationType,
                GetTokenSuffix(request.Token));
            var problemDetails = new ProblemDetails
            {
                Title = "Firebase topic subscription unavailable",
                Detail = "Push token registration could not be completed because Firebase topic subscription is currently unavailable.",
                Status = StatusCodes.Status503ServiceUnavailable,
                Type = "https://httpstatuses.com/503",
                Instance = HttpContext.Request.Path
            };
            problemDetails.Extensions["code"] = "firebase_topic_subscription_unavailable";
            problemDetails.Extensions["traceId"] = HttpContext.TraceIdentifier;
            problemDetails.Extensions["userId"] = userId;
            problemDetails.Extensions["applicationType"] = request.ApplicationType.ToString();
            return StatusCode(StatusCodes.Status503ServiceUnavailable, problemDetails);
        }
    }

    [HttpPost("unregister")]
    public async Task<IActionResult> Unregister([FromBody] UnregisterPushTokenRequest request, CancellationToken cancellationToken)
    {
        var userId = currentUserService.GetUserId();
        var role = currentUserService.GetUserRole();
        logger.LogInformation(
            "Received push token unregister request. UserId={UserId}; Role={Role}; ApplicationType={ApplicationType}; TokenSuffix={TokenSuffix}",
            userId,
            role,
            request.ApplicationType,
            GetTokenSuffix(request.Token));
        if (userId == Guid.Empty)
        {
            return Unauthorized();
        }

        if (!CanManageApplicationType(request.ApplicationType))
        {
            return Forbid();
        }

        await pushTokenService.UnregisterAsync(userId, request, cancellationToken);
        logger.LogInformation(
            "Push token unregister request completed. UserId={UserId}; ApplicationType={ApplicationType}; TokenSuffix={TokenSuffix}",
            userId,
            request.ApplicationType,
            GetTokenSuffix(request.Token));
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

    private static string GetTokenSuffix(string token)
    {
        if (string.IsNullOrWhiteSpace(token))
        {
            return string.Empty;
        }

        return token.Length <= 12 ? token : token[^12..];
    }

    private static bool IsSubscriptionUnavailableFailure(Exception exception)
    {
        var current = exception;
        while (current is not null)
        {
            if (current is FirebaseSubscriptionUnavailableException)
            {
                return true;
            }

            if (current is InvalidOperationException &&
                string.Equals(current.Message, "Firebase topic subscription is not initialized.", StringComparison.Ordinal))
            {
                return true;
            }

            current = current.InnerException;
        }

        return false;
    }
}

using AuthService.Abstractions;
using AuthService.DTOs.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

[ApiController]
[Route("connect")]
public sealed class ConnectController(IAuthService authService) : ControllerBase
{
    [HttpPost("token")]
    [AllowAnonymous]
    public async Task<IActionResult> ConnectToken([FromForm] TokenRequest request, CancellationToken cancellationToken)
    {
        var response = await authService.IssueTokenAsync(request, cancellationToken);
        return Ok(new
        {
            access_token = response.AccessToken,
            token_type = response.TokenType,
            expires_in = response.ExpiresIn
        });
    }
}

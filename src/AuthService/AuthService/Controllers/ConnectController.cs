using AuthService.Abstractions;
using AuthService.DTOs.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

[ApiController]
[Route("connect")]
public sealed class ConnectController(IAuthService authService) : ControllerBase
{
    [HttpPost("authorize")]
    [AllowAnonymous]
    public async Task<IActionResult> ConnectAuthorize([FromBody] AuthorizeRequest request, CancellationToken cancellationToken)
    {
        var response = await authService.AuthorizeAsync(request, cancellationToken);
        return Ok(new
        {
            code = response.Code,
            state = response.State,
            redirect_uri = response.RedirectUri
        });
    }

    [HttpPost("token")]
    [AllowAnonymous]
    [Consumes("application/x-www-form-urlencoded")]
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

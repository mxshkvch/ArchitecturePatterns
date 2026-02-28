using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.Contracts.Common.Abstractions;
using UserService.Contracts.Requests;

namespace UserService.Controllers;

[ApiController]
[Route("api/auth")]
[Tags("Auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var token = await authService.LoginAsync(request, cancellationToken);
            return Ok(new { token });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterClientRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var response = await authService.RegisterClientAsync(request, cancellationToken);
            return StatusCode(201, response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}

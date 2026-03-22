using AuthService.Abstractions;
using AuthService.DTOs.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthService.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken cancellationToken)
    {
        var token = await authService.LoginAsync(request, cancellationToken);
        return Ok(new { token });
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register([FromBody] RegisterClientRequest request, CancellationToken cancellationToken)
    {
        var response = await authService.RegisterClientAsync(request, cancellationToken);
        return StatusCode(201, response);
    }

    [HttpPost("users")]
    [Authorize(Roles = "ADMIN,EMPLOYEE,SERVICE")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request, CancellationToken cancellationToken)
    {
        var response = await authService.CreateUserAsync(request, cancellationToken);
        return StatusCode(201, response);
    }

}

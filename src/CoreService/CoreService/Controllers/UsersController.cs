using CoreService.Abstractions;
using CoreService.DTOs.Requests;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoreService.Controllers;

[ApiController]
[Route("api/admin/users")]
[Authorize(Roles = "ADMIN,EMPLOYEE")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] int page = 0, [FromQuery] int size = 20, [FromQuery] string? role = null)
    {
        var response = await _userService.GetUsersAsync(page, size, role);
        return Ok(response);
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> CreateUserAdmin([FromBody] CreateUserAdminRequest request)
    {
        var response = await _userService.CreateUserAdminAsync(request);
        return StatusCode(201, response);
    }

    [HttpPatch("{userId}/status")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> UpdateUserStatus(Guid userId, [FromBody] UpdateUserStatusRequest request)
    {
        var response = await _userService.UpdateUserStatusAsync(userId, request);
        return Ok(response);
    }
}
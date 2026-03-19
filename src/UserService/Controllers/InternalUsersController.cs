using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserService.Contracts.Common.Abstractions;
using UserService.Contracts.Requests;
using UserService.Data;

namespace UserService.Controllers
{
    [ApiController]
    [Route("internal/users")]
    [Authorize(Roles = "SERVICE,ADMIN,EMPLOYEE")]
    [Tags("Internal User Directory")]
    public class InternalUsersController(IUserManagementService userManagementService, UserDbContext dbContext) : ControllerBase
    {
        [HttpPost("profiles")]
        public async Task<IActionResult> CreateUserProfile([FromBody] CreateUserProfileRequest request, CancellationToken cancellationToken)
        {
            var response = await userManagementService.CreateUserProfileAsync(request, cancellationToken);
            return Created($"/internal/users/{response.Id}", response);
        }

        [HttpGet("{userId:guid}/access")]
        public async Task<IActionResult> GetUserAccess(Guid userId, CancellationToken cancellationToken)
        {
            var user = await dbContext.Users
                .AsNoTracking()
                .Where(x => x.Id == userId)
                .Select(x => new
                {
                    x.Id,
                    Role = x.Role.ToString(),
                    Status = x.Status.ToString()
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (user is null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllUsers(CancellationToken cancellationToken)
        {
            var users = await dbContext.Users
                .AsNoTracking()
                .Select(x => new
                {
                    x.Id,
                    Role = x.Role.ToString(),
                    Status = x.Status.ToString()
                })
                .ToListAsync(cancellationToken);

            if (users.Count == 0)
            {
                return NotFound();
            }

            return Ok(users);
        }
    }
}

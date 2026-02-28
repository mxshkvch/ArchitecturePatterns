using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserService.Data;

namespace UserService.Controllers
{
    [ApiController]
    [Route("internal/users")]
    [Authorize]
    public class InternalUsersController(UserDbContext dbContext) : ControllerBase
    {
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
    }
}

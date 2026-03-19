using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserService.Data;
using UserService.Domain;

namespace UserService.Controllers
{
    [ApiController]
    [Route("internal/users")]

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

        [HttpGet("{userId:guid}/creditHistory")]
        public async Task<IActionResult> GetUserCreditHistory(Guid userId, CancellationToken cancellationToken)
        {
            int? userCreditHistory = await dbContext.Users
                .AsNoTracking()
                .Where(x => x.Id == userId)
                .Select(x => x.creditHistory)
                .FirstOrDefaultAsync(cancellationToken);

            if (userCreditHistory is null)
            {
                return NotFound();
            }

            return Ok(userCreditHistory);
        }

        [HttpPatch("{userId:guid}/creditHistory")]
        public async Task<IActionResult> ChangeCreditHistory(Guid userId, int amount, CancellationToken cancellationToken)
        {
            User? user = await dbContext.Users
                .AsNoTracking()
                .Where(x => x.Id == userId)
                .FirstOrDefaultAsync(cancellationToken);

            if (user is null)
            {
                return NotFound();
            }

            user.creditHistory += amount; //если отрцательно должно уменьшаться

            if (user.creditHistory < 0)
                user.creditHistory = 0;

            dbContext.Update(user);

            await dbContext.SaveChangesAsync();

            return Ok(user.creditHistory);
        }
    }
}

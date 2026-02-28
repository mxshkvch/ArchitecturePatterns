using Microsoft.AspNetCore.Mvc;
using UserService.Contracts.Requests;
using UserService.Data;
using UserService.Domain;
using UserService.Domain.Enums;

namespace UserService.Controllers
{
    [ApiController]
    [Route("internal/users")]
    public class InternalUsersController : ControllerBase
    {
        private readonly UserDbContext _dbContext;

        public InternalUsersController(UserDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateUserAdminRequest request)
        {
            var user = new User
            {
                Id = (Guid)request.id,
                Email = request.Email,
                Role = request.Role,
                PasswordHash = request.Password,
                Status = (UserStatus)UserRole.CLIENT,
                CreatedAt = DateTime.UtcNow,
                FirstName = request.FirstName,
                LastName = request.LastName,
                Phone = request.Phone
            };

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync();

            return Ok();
        }
    }
}

namespace CreditService.Services.Models
{
    //раскидать по файлам потом enum'ы
    public class User
    {
        public Guid Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public UserRole Role { get; set; } = UserRole.CLIENT;
        public UserStatus Status { get; set; } = UserStatus.PENDING;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
        public string PasswordHash { get; set; } = string.Empty;
    }

    public enum UserRole
    {
        CLIENT,
        EMPLOYEE,
        ADMIN
    }

    public enum UserStatus
    {
        ACTIVE,
        BLOCKED,
        PENDING
    }
}

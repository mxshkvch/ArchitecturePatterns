using UserService.Domain.Enums;

namespace UserService.Domain;

public sealed class User
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
    public int creditHistory { get; set; } = 1000; //1000 база, 700 не выдавать кредиты выше 100000 рублей, 500 и ниже - не выдавать ничего пока не восстановит
                                                   //повышать можно: оплаченным кредитом, количеством денег на счету - за каждую 1000 плюс 15 очков. Деньги уходят - кредитный рейтинг тоже уменьшается
                                                   //в dotnet database внести изменение
}

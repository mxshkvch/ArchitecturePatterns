using BffService.Entities;
using Microsoft.EntityFrameworkCore;

namespace BffService.Data;

public sealed class BffDbContext(DbContextOptions<BffDbContext> options) : DbContext(options)
{
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();
    public DbSet<PushTokenRegistration> PushTokenRegistrations => Set<PushTokenRegistration>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<UserSettings>();
        entity.HasKey(x => x.Id);
        entity.HasIndex(x => new { x.UserId, x.ApplicationType }).IsUnique();
        entity.Property(x => x.HiddenAccountIdsJson).IsRequired();
        entity.Property(x => x.UpdatedAt).IsRequired();

        var pushTokenEntity = modelBuilder.Entity<PushTokenRegistration>();
        pushTokenEntity.HasKey(x => x.Id);
        pushTokenEntity.HasIndex(x => x.Token).IsUnique();
        pushTokenEntity.HasIndex(x => new { x.UserId, x.ApplicationType });
        pushTokenEntity.Property(x => x.Token).HasMaxLength(4096).IsRequired();
        pushTokenEntity.Property(x => x.CreatedAt).IsRequired();
        pushTokenEntity.Property(x => x.UpdatedAt).IsRequired();
    }
}

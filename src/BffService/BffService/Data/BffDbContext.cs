using BffService.Entities;
using Microsoft.EntityFrameworkCore;

namespace BffService.Data;

public sealed class BffDbContext(DbContextOptions<BffDbContext> options) : DbContext(options)
{
    public DbSet<UserSettings> UserSettings => Set<UserSettings>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<UserSettings>();
        entity.HasKey(x => x.Id);
        entity.HasIndex(x => new { x.UserId, x.ApplicationType }).IsUnique();
        entity.Property(x => x.HiddenAccountIdsJson).IsRequired();
        entity.Property(x => x.UpdatedAt).IsRequired();
    }
}

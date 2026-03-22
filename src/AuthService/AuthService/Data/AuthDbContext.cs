using AuthService.Entities;
using Microsoft.EntityFrameworkCore;

namespace AuthService.Data;

public class AuthDbContext : DbContext
{
    public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<AuthorizationCode> AuthorizationCodes { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>().HasKey(u => u.Id);
        modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();

        modelBuilder.Entity<AuthorizationCode>().HasKey(a => a.Code);
        modelBuilder.Entity<AuthorizationCode>().HasIndex(a => a.ExpiresAt);

        modelBuilder.Entity<RefreshToken>().HasKey(r => r.Token);
        modelBuilder.Entity<RefreshToken>().HasIndex(r => r.ExpiresAt);
    }
}

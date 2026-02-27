using CoreService.Entities;
using Microsoft.EntityFrameworkCore;

namespace CoreService.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Account> Accounts { get; set; }
    public DbSet<Transaction> Transactions { get; set; }
    public DbSet<CreditTariff> CreditTariffs { get; set; }
    public DbSet<Credit> Credits { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Account>().HasKey(a => a.Id);
        modelBuilder.Entity<Account>().HasIndex(a => a.AccountNumber).IsUnique();

        modelBuilder.Entity<Transaction>().HasKey(t => t.Id);
        modelBuilder.Entity<CreditTariff>().HasKey(ct => ct.Id);
        modelBuilder.Entity<Credit>().HasKey(c => c.Id);
    }
}
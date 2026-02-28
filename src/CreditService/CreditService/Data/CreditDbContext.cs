using CreditService.Domain;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;
using CreditService.Domain;

namespace UserService.Data;

public sealed class CreditDbContext(DbContextOptions<CreditDbContext> options) : DbContext(options)
{
    public DbSet<Credit> Credits => Set<Credit>();
    public DbSet<CreditTariff> Tariffs => Set<CreditTariff>(); 

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var credits = modelBuilder.Entity<Credit>();
        credits.HasKey(x => x.Id);

        var tariffs = modelBuilder.Entity<Credit>();
        tariffs.HasKey(x => x.Id);
    }
}
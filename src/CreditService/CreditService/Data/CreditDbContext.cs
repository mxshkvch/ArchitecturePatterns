using CreditService.Domain;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;
using CreditService.Domain;

namespace UserService.Data;

public sealed class CreditDbContext(DbContextOptions<CreditDbContext> options) : DbContext(options)
{
    public DbSet<Credit> Credits => Set<Credit>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var credits = modelBuilder.Entity<Credit>();
        credits.HasKey(x => x.Id);
    }
}
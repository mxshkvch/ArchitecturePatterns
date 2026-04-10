using Microsoft.EntityFrameworkCore;
using MonitoringService.Domain.Entities;

namespace MonitoringService.Data;

public sealed class MonitoringDbContext(DbContextOptions<MonitoringDbContext> options) : DbContext(options)
{
    public DbSet<RequestLog> RequestLogs => Set<RequestLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(MonitoringDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}

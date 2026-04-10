using Microsoft.EntityFrameworkCore;
using MonitoringService.Data;
using MonitoringService.Domain.Entities;

namespace MonitoringService.Repositories;

public sealed class MonitoringRepository(MonitoringDbContext dbContext) : IMonitoringRepository
{
    public async Task AddAsync(RequestLog log, CancellationToken cancellationToken = default)
    {
        dbContext.RequestLogs.Add(log);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<RequestLog>> GetLatestLogsAsync(int limit, CancellationToken cancellationToken = default)
    {
        return await dbContext.RequestLogs
            .AsNoTracking()
            .OrderByDescending(x => x.CreatedAtUtc)
            .Take(limit)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<RequestLog>> GetLogsSinceAsync(DateTime sinceUtc, CancellationToken cancellationToken = default)
    {
        return await dbContext.RequestLogs
            .AsNoTracking()
            .Where(x => x.CreatedAtUtc >= sinceUtc)
            .OrderByDescending(x => x.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }
}

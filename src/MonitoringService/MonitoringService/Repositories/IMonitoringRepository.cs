using MonitoringService.Domain.Entities;

namespace MonitoringService.Repositories;

public interface IMonitoringRepository
{
    Task AddAsync(RequestLog log, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RequestLog>> GetLatestLogsAsync(int limit, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<RequestLog>> GetLogsSinceAsync(DateTime sinceUtc, CancellationToken cancellationToken = default);
}

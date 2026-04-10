using MonitoringService.Contracts.Requests;
using MonitoringService.Contracts.Responses;

namespace MonitoringService.Services;

public interface IMonitoringService
{
    Task<bool> SaveLogAsync(MonitoringLogRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MonitoringLogItem>> GetLogsAsync(int limit, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<MonitoringStatItem>> GetStatsAsync(int minutes, CancellationToken cancellationToken = default);
}

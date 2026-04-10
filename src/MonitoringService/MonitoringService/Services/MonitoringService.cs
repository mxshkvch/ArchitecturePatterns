using MonitoringService.Contracts.Requests;
using MonitoringService.Contracts.Responses;
using MonitoringService.Domain.Entities;
using MonitoringService.Repositories;

namespace MonitoringService.Services;

public sealed class MonitoringService(IMonitoringRepository repository) : IMonitoringService
{
    public async Task<bool> SaveLogAsync(MonitoringLogRequest request, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.ServiceName))
        {
            return false;
        }

        var log = new RequestLog
        {
            ServiceName = request.ServiceName,
            Method = request.Method,
            Path = request.Path,
            StatusCode = request.StatusCode,
            DurationMs = request.DurationMs,
            ErrorPercentage = request.ErrorPercentage,
            TraceId = request.TraceId,
            IsError = request.IsError,
            CreatedAtUtc = request.CreatedAtUtc == default ? DateTime.UtcNow : request.CreatedAtUtc
        };

        await repository.AddAsync(log, cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<MonitoringLogItem>> GetLogsAsync(int limit, CancellationToken cancellationToken = default)
    {
        var boundedLimit = Math.Clamp(limit, 1, 1000);
        var logs = await repository.GetLatestLogsAsync(boundedLimit, cancellationToken);

        return logs.Select(x => new MonitoringLogItem
        {
            Id = x.Id,
            ServiceName = x.ServiceName,
            Method = x.Method ?? string.Empty,
            Path = x.Path ?? string.Empty,
            StatusCode = x.StatusCode,
            DurationMs = x.DurationMs,
            ErrorPercentage = x.ErrorPercentage,
            TraceId = x.TraceId ?? string.Empty,
            IsError = x.IsError,
            CreatedAtUtc = x.CreatedAtUtc
        }).ToArray();
    }

    public async Task<IReadOnlyList<MonitoringStatItem>> GetStatsAsync(int minutes, CancellationToken cancellationToken = default)
    {
        var boundedMinutes = Math.Clamp(minutes, 1, 24 * 60);
        var sinceUtc = DateTime.UtcNow.AddMinutes(-boundedMinutes);
        var logs = await repository.GetLogsSinceAsync(sinceUtc, cancellationToken);

        return logs
            .GroupBy(x => new
            {
                Bucket = new DateTime(x.CreatedAtUtc.Ticks - (x.CreatedAtUtc.Ticks % TimeSpan.TicksPerMinute), DateTimeKind.Utc),
                x.ServiceName
            })
            .OrderByDescending(group => group.Key.Bucket)
            .ThenBy(group => group.Key.ServiceName)
            .Select(group => new MonitoringStatItem
            {
                MinuteBucket = group.Key.Bucket,
                ServiceName = group.Key.ServiceName,
                TotalRequests = group.LongCount(),
                FailedRequests = group.LongCount(item => item.IsError),
                AvgDurationMs = group.Average(item => item.DurationMs),
                MaxDurationMs = group.Max(item => item.DurationMs)
            })
            .ToArray();
    }
}

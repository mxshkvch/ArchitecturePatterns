namespace MonitoringService.Contracts.Responses;

public sealed class MonitoringStatItem
{
    public DateTime MinuteBucket { get; init; }
    public string ServiceName { get; init; } = string.Empty;
    public long TotalRequests { get; init; }
    public long FailedRequests { get; init; }
    public double AvgDurationMs { get; init; }
    public double MaxDurationMs { get; init; }
}

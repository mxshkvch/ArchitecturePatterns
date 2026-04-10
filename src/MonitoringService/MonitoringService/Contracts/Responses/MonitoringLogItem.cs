namespace MonitoringService.Contracts.Responses;

public sealed class MonitoringLogItem
{
    public long Id { get; init; }
    public string ServiceName { get; init; } = string.Empty;
    public string Method { get; init; } = string.Empty;
    public string Path { get; init; } = string.Empty;
    public int StatusCode { get; init; }
    public double DurationMs { get; init; }
    public double ErrorPercentage { get; init; }
    public string TraceId { get; init; } = string.Empty;
    public bool IsError { get; init; }
    public DateTime CreatedAtUtc { get; init; }
}

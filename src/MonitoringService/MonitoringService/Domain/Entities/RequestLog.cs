namespace MonitoringService.Domain.Entities;

public sealed class RequestLog
{
    public long Id { get; set; }
    public string ServiceName { get; set; } = string.Empty;
    public string? Method { get; set; }
    public string? Path { get; set; }
    public int StatusCode { get; set; }
    public double DurationMs { get; set; }
    public double ErrorPercentage { get; set; }
    public string? TraceId { get; set; }
    public bool IsError { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

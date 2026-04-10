namespace MonitoringService.Contracts.Requests;

public sealed record MonitoringLogRequest(
    string ServiceName,
    string Method,
    string Path,
    int StatusCode,
    double DurationMs,
    double ErrorPercentage,
    string TraceId,
    bool IsError,
    DateTime CreatedAtUtc);

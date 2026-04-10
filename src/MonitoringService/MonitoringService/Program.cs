using Dapper;
using Npgsql;
using NSwag;
using System.Net;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApiDocument(options =>
{
    options.Title = "MonitoringService API";
    options.Description = "Stores and provides request tracing telemetry from backend services.";
});

var app = builder.Build();
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new ArgumentException("ConnectionStrings:DefaultConnection cannot be null");

await EnsureSchemaAsync(connectionString);

if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

app.MapPost("/api/monitoring/logs", async (MonitoringLogRequest request) =>
{
    if (string.IsNullOrWhiteSpace(request.ServiceName))
    {
        return Results.BadRequest(new { title = "Invalid request", detail = "serviceName is required" });
    }

    await using var connection = new NpgsqlConnection(connectionString);

    const string insertSql = @"
        INSERT INTO monitoring.request_logs
        (service_name, method, path, status_code, duration_ms, error_percentage, trace_id, is_error, created_at_utc)
        VALUES
        (@ServiceName, @Method, @Path, @StatusCode, @DurationMs, @ErrorPercentage, @TraceId, @IsError, @CreatedAtUtc);";

    await connection.ExecuteAsync(insertSql, new
    {
        request.ServiceName,
        request.Method,
        request.Path,
        request.StatusCode,
        request.DurationMs,
        request.ErrorPercentage,
        request.TraceId,
        request.IsError,
        CreatedAtUtc = request.CreatedAtUtc == default ? DateTime.UtcNow : request.CreatedAtUtc
    });

    return Results.StatusCode((int)HttpStatusCode.Accepted);
});

app.MapGet("/api/monitoring/logs", async (int limit = 100) =>
{
    var boundedLimit = Math.Clamp(limit, 1, 1000);
    await using var connection = new NpgsqlConnection(connectionString);

    const string sql = @"
        SELECT id,
               service_name AS ServiceName,
               method,
               path,
               status_code AS StatusCode,
               duration_ms AS DurationMs,
               error_percentage AS ErrorPercentage,
               trace_id AS TraceId,
               is_error AS IsError,
               created_at_utc AS CreatedAtUtc
        FROM monitoring.request_logs
        ORDER BY created_at_utc DESC
        LIMIT @Limit;";

    var logs = await connection.QueryAsync<MonitoringLogItem>(sql, new { Limit = boundedLimit });
    return Results.Ok(logs);
});

app.MapGet("/api/monitoring/stats", async (int minutes = 60) =>
{
    var boundedMinutes = Math.Clamp(minutes, 1, 24 * 60);
    await using var connection = new NpgsqlConnection(connectionString);

    const string sql = @"
        SELECT date_trunc('minute', created_at_utc) AS MinuteBucket,
               service_name AS ServiceName,
               count(*) AS TotalRequests,
               sum(CASE WHEN is_error THEN 1 ELSE 0 END) AS FailedRequests,
               avg(duration_ms) AS AvgDurationMs,
               max(duration_ms) AS MaxDurationMs
        FROM monitoring.request_logs
        WHERE created_at_utc >= (NOW() AT TIME ZONE 'UTC') - (@Minutes || ' minutes')::interval
        GROUP BY MinuteBucket, ServiceName
        ORDER BY MinuteBucket DESC, ServiceName ASC;";

    var stats = await connection.QueryAsync<MonitoringStatItem>(sql, new { Minutes = boundedMinutes });
    return Results.Ok(stats);
});

app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();

static async Task EnsureSchemaAsync(string connectionString)
{
    await using var connection = new NpgsqlConnection(connectionString);

    const string sql = @"
        CREATE SCHEMA IF NOT EXISTS monitoring;

        CREATE TABLE IF NOT EXISTS monitoring.request_logs
        (
            id BIGSERIAL PRIMARY KEY,
            service_name TEXT NOT NULL,
            method TEXT,
            path TEXT,
            status_code INTEGER NOT NULL,
            duration_ms DOUBLE PRECISION NOT NULL,
            error_percentage DOUBLE PRECISION NOT NULL,
            trace_id TEXT,
            is_error BOOLEAN NOT NULL,
            created_at_utc TIMESTAMPTZ NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_request_logs_created_at ON monitoring.request_logs(created_at_utc DESC);
        CREATE INDEX IF NOT EXISTS idx_request_logs_service_name ON monitoring.request_logs(service_name);
    ";

    await connection.ExecuteAsync(sql);
}

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

public sealed class MonitoringStatItem
{
    public DateTime MinuteBucket { get; init; }
    public string ServiceName { get; init; } = string.Empty;
    public long TotalRequests { get; init; }
    public long FailedRequests { get; init; }
    public double AvgDurationMs { get; init; }
    public double MaxDurationMs { get; init; }
}

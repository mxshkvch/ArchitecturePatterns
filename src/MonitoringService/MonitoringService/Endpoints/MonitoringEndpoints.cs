using System.Net;
using MonitoringService.Contracts.Requests;
using MonitoringService.Services;

namespace MonitoringService.Endpoints;

public static class MonitoringEndpoints
{
    public static IEndpointRouteBuilder MapMonitoringEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/monitoring/logs", SaveLogAsync);
        app.MapGet("/api/monitoring/logs", GetLogsAsync);
        app.MapGet("/api/monitoring/stats", GetStatsAsync);

        return app;
    }

    private static async Task<IResult> SaveLogAsync(
        MonitoringLogRequest request,
        IMonitoringService monitoringService,
        CancellationToken cancellationToken)
    {
        var isSaved = await monitoringService.SaveLogAsync(request, cancellationToken);

        if (!isSaved)
        {
            return Results.BadRequest(new { title = "Invalid request", detail = "serviceName is required" });
        }

        return Results.StatusCode((int)HttpStatusCode.Accepted);
    }

    private static async Task<IResult> GetLogsAsync(
        int? limit,
        IMonitoringService monitoringService,
        CancellationToken cancellationToken)
    {
        var logs = await monitoringService.GetLogsAsync(limit ?? 100, cancellationToken);
        return Results.Ok(logs);
    }

    private static async Task<IResult> GetStatsAsync(
        int? minutes,
        IMonitoringService monitoringService,
        CancellationToken cancellationToken)
    {
        var stats = await monitoringService.GetStatsAsync(minutes ?? 60, cancellationToken);
        return Results.Ok(stats);
    }
}

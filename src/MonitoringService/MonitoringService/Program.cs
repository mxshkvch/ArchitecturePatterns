using MonitoringService.Data;
using MonitoringService.Endpoints;
using MonitoringService.Repositories;
using MonitoringService.Services;
using NSwag;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApiDocument(options =>
{
    options.Title = "MonitoringService API";
    options.Description = "Stores and provides request tracing telemetry from backend services.";
});

builder.Services.AddMonitoringDataAccess(builder.Configuration);
builder.Services.AddScoped<IMonitoringRepository, MonitoringRepository>();
builder.Services.AddScoped<IMonitoringService, Services.MonitoringService>();

var app = builder.Build();

await app.EnsureMonitoringDatabaseAsync();

if (app.Environment.IsDevelopment())
{
    app.UseOpenApi();
    app.UseSwaggerUi();
}

app.MapMonitoringEndpoints();
app.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.Run();

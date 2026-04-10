using Microsoft.EntityFrameworkCore;

namespace MonitoringService.Data;

public static class MonitoringDataAccessExtensions
{
    public static IServiceCollection AddMonitoringDataAccess(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new ArgumentException("ConnectionStrings:DefaultConnection cannot be null");

        services.AddDbContext<MonitoringDbContext>(options => options.UseNpgsql(connectionString));

        return services;
    }

    public static async Task EnsureMonitoringDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<MonitoringDbContext>();
        await dbContext.Database.EnsureCreatedAsync();
    }
}

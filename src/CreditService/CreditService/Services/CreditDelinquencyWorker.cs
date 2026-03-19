using CreditService.Domain.Enum;
using Microsoft.EntityFrameworkCore;
using UserService.Data;

namespace CreditService.Services;

public sealed class CreditDelinquencyWorker(IServiceScopeFactory serviceScopeFactory) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var timer = new PeriodicTimer(TimeSpan.FromMinutes(1));

        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            using var scope = serviceScopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<CreditDbContext>();

            var now = DateTimeOffset.UtcNow;

            var toOverdue = await dbContext.Credits
                .Where(x => x.status == StatusCredit.ACTIVE && x.endDate < now && x.remainingAmount > 0)
                .ToListAsync(stoppingToken);

            var toDefaulted = await dbContext.Credits
                .Where(x => x.status == StatusCredit.OVERDUE && x.endDate < now.AddDays(-30) && x.remainingAmount > 0)
                .ToListAsync(stoppingToken);

            if (toOverdue.Count == 0 && toDefaulted.Count == 0)
            {
                continue;
            }

            foreach (var credit in toOverdue)
            {
                credit.status = StatusCredit.OVERDUE;
            }

            foreach (var credit in toDefaulted)
            {
                credit.status = StatusCredit.DEFAULTED;
            }

            await dbContext.SaveChangesAsync(stoppingToken);
        }
    }
}

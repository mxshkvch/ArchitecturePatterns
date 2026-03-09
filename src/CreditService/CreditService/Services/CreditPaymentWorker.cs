using CreditService.Domain.Abstractions;
using CreditService.Domain.Enum;
using Microsoft.EntityFrameworkCore;
using System;
using UserService.Data;
using CreditService.Services.Abstractions;

namespace CreditService.Services
{
    public class CreditPaymentWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public CreditPaymentWorker(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var timer = new PeriodicTimer(TimeSpan.FromSeconds(25));

            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                using var scope = _scopeFactory.CreateScope();

                var context = scope.ServiceProvider.GetRequiredService<CreditDbContext>();
                var creditService = scope.ServiceProvider.GetRequiredService<ICreditService>();

                var credits = await context.Credits
                    .Where(c => c.status == StatusCredit.ACTIVE)
                    .Select(c => c.Id)
                    .ToListAsync(stoppingToken);

                foreach (var creditId in credits)
                {
                    try
                    {
                        await creditService.AutomaticPayCreditById(creditId);
                    }
                    catch
                    {
                    }
                }
            }
        }

    }
}

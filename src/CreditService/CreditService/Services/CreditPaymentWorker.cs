using CreditService.Domain;
using CreditService.Domain.Abstractions;
using CreditService.Domain.Enum;
using CreditService.Services.Abstractions;
using Microsoft.EntityFrameworkCore;
using UserService.Data;

namespace CreditService.Services
{
    public class CreditPaymentWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<CreditPaymentWorker> _logger;

        public CreditPaymentWorker(IServiceScopeFactory scopeFactory, ILogger<CreditPaymentWorker> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var timer = new PeriodicTimer(TimeSpan.FromMinutes(1));

            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();
                    var context = scope.ServiceProvider.GetRequiredService<CreditDbContext>();
                    var coreServiceClient = scope.ServiceProvider.GetRequiredService<ICoreServiceClient>();

                    var utcNow = DateTimeOffset.UtcNow;

                    // Списание по активным кредитам
                    var activeCredits = await context.Credits
                        .Where(c => c.status == StatusCredit.ACTIVE && c.remainingAmount > 0)
                        .ToListAsync(stoppingToken);

                    foreach (var credit in activeCredits)
                    {
                        try
                        {
                            var minutesSinceLastPayment = (utcNow - (credit.LastPaymentDate ?? credit.startDate)).TotalMinutes;
                            var missedPayments = (int)(minutesSinceLastPayment / credit.PaymentFrequencyMinutes);

                            if (missedPayments <= 0) continue;

                            var paymentAmount = Math.Round(credit.remainingAmount / 
                                ((credit.endDate - credit.startDate).TotalMinutes / credit.PaymentFrequencyMinutes), 2);

                            paymentAmount = Math.Min(paymentAmount * missedPayments, credit.remainingAmount);

                            if (paymentAmount <= 0) continue;

                            bool isPaid = await coreServiceClient.PayUserAccountCreditAsync(
                                credit.userId,
                                credit.accountId,
                                paymentAmount,
                                stoppingToken);

                            if (!isPaid)
                            {
                                _logger.LogWarning("Failed to pay {Amount} for credit {CreditId}", paymentAmount, credit.Id);
                                continue;
                            }

                            credit.remainingAmount = Math.Round(credit.remainingAmount - paymentAmount, 2);
                            credit.LastPaymentDate = utcNow;

                            if (credit.remainingAmount <= 0)
                            {
                                credit.status = StatusCredit.PAID;
                            }

                            await context.SaveChangesAsync(stoppingToken);
                            _logger.LogInformation("Paid {Amount} for credit {CreditId}", paymentAmount, credit.Id);
                            
                            context.ChangeTracker.Clear();
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Failed to process payment for credit {CreditId}", credit.Id);
                        }
                    }
                    
                    var activeCreditsForStatus = await context.Credits
                        .Where(c => c.status == StatusCredit.ACTIVE && c.remainingAmount > 0)
                        .ToListAsync(stoppingToken);

                    var creditsToOverdue = activeCreditsForStatus
                        .Where(c => c.endDate < utcNow || 
                            (utcNow - (c.LastPaymentDate ?? c.startDate)).TotalMinutes > c.PaymentFrequencyMinutes * 2)
                        .ToList();

                    var creditsToDefaulted = await context.Credits
                        .Where(c => c.status == StatusCredit.OVERDUE && c.remainingAmount > 0 && c.endDate < utcNow.AddDays(-30))
                        .ToListAsync(stoppingToken);

                    foreach (var credit in creditsToOverdue)
                    {
                        credit.status = StatusCredit.OVERDUE;
                        _logger.LogInformation("Credit {CreditId} marked as OVERDUE", credit.Id);
                    }

                    foreach (var credit in creditsToDefaulted)
                    {
                        credit.status = StatusCredit.DEFAULTED;
                        _logger.LogInformation("Credit {CreditId} marked as DEFAULTED", credit.Id);
                    }

                    if (creditsToOverdue.Count > 0 || creditsToDefaulted.Count > 0)
                    {
                        await context.SaveChangesAsync(stoppingToken);
                    }
                }
                catch (Exception exception)
                {
                    _logger.LogError(exception, "CreditPaymentWorker iteration failed");
                }
            }
        }
    }
}

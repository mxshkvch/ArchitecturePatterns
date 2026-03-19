using CreditService.Domain;
using CreditService.Domain.Abstractions;
using CreditService.Domain.Enum;
using CreditService.Services.Abstractions;
using CreditService.Services.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Claims;
using UserService.Data;

namespace CreditService.Services
{
    public class CreditPaymentWorker : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IUserServiceClient _userServiceClient;
        private readonly ICoreServiceClient _coreServiceClient;
        public CreditPaymentWorker(IServiceScopeFactory scopeFactory, IHttpContextAccessor httpContextAccessor, IUserServiceClient userServiceClient, ICoreServiceClient coreServiceClient)
        {
            _scopeFactory = scopeFactory;
            _httpContextAccessor = httpContextAccessor;
            _userServiceClient = userServiceClient;
            _coreServiceClient = coreServiceClient;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            var timer = new PeriodicTimer(TimeSpan.FromSeconds(5));

            while (await timer.WaitForNextTickAsync(stoppingToken))
            {
                try
                {
                    using var scope = _scopeFactory.CreateScope();

                    var context = scope.ServiceProvider.GetRequiredService<CreditDbContext>();
                    var creditService = scope.ServiceProvider.GetRequiredService<ICreditService>();

                    List<UserAccessResponse> users = await GetAllUsersAsync();

                    foreach (var user in users)
                    {
                        if (user == null)
                        {
                            continue;
                        }

                        var credits = await context.Credits
                            .Where(c => c.status == StatusCredit.ACTIVE && c.userId == user.Id)
                            .ToListAsync(stoppingToken);

                        foreach (Credit credit in credits)
                        {
                            await creditService.AutomaticPayCreditById(credit.Id, credit.accountId);
                        }
                    }
                }
                catch (Exception exception)
                {
                    Console.WriteLine($"CreditPaymentWorker iteration failed: {exception.Message}");
                }
            }
        }

        private async Task<UserAccessResponse> GetCurrentUserAsync()
        {
            var userIdClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                throw new UnauthorizedAccessException("User is not authenticated");
            }

            var userAccess = await _userServiceClient.GetUserAccessAsync(userId, CancellationToken.None);
            if (!string.Equals(userAccess.Status, "ACTIVE", StringComparison.OrdinalIgnoreCase))
            {
                throw new UnauthorizedAccessException("User is not active");
            }

            return userAccess;
        }

        private async Task<List<UserAccessResponse>> GetAllUsersAsync()
        {
            var userAccess = await _userServiceClient.GetAllUsers(CancellationToken.None);

            return userAccess;
        }
    }
}

using CreditService.Data;
using CreditService.Data.Responses;
using CreditService.Domain;
using CreditService.Domain.Abstractions;
using CreditService.Domain.Enum;
using CreditService.Domain.Models;
using CreditService.Services.Abstractions;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CreditService.Services
{
    public class CreditService : ICreditService
    {
        private readonly CreditDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IUserServiceClient _userServiceClient;

        public CreditService(
            CreditDbContext context,
            IHttpContextAccessor httpContextAccessor,
            IUserServiceClient userServiceClient)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _httpContextAccessor = httpContextAccessor;
            _userServiceClient = userServiceClient;
        }

        public async Task<CreditTariffResponse> GetAvailableTarrifs(int page, int size)
        {
            ValidatePagination(page, size);

            var query = _context.Tariffs
                .Where(t => t.status == StatusCredit.ACTIVE)
                .AsNoTracking();

            return await BuildTariffResponse(query, page, size);
        }

        public async Task<Credit> ApplyCredit(ApplyForCreditRequest request)
        {
            if (request == null)
                throw new ArgumentException("Request is null");

            if (request.amount <= 0)
                throw new ArgumentException("Amount must be greater than zero");

            var currentUser = await GetCurrentUserAsync();

            var tariff = await _context.Tariffs
                .FirstOrDefaultAsync(t => t.Id == request.tariffId);

            if (tariff == null)
                throw new KeyNotFoundException("Tariff not found");

            if (tariff.status != StatusCredit.ACTIVE)
                throw new InvalidOperationException("Tariff is not active");

            var credit = new Credit
            {
                Id = Guid.NewGuid(),
                userId = currentUser.Id,
                tarrifId = tariff.Id,
                principal = request.amount,
                remainingAmount = request.amount,
                interestRate = tariff.interestRate,
                status = StatusCredit.ACTIVE,
                startDate = DateTime.UtcNow,
                endDate = DateTime.UtcNow.AddDays(90),
            };

            _context.Credits.Add(credit);
            await _context.SaveChangesAsync();

            return credit;
        }

        public async Task<CreditsResponse> GetMyCredits(int page, int size)
        {
            ValidatePagination(page, size);
            var currentUser = await GetCurrentUserAsync();

            var query = _context.Credits
                                .Where(c => c.userId == currentUser.Id)
                                .AsNoTracking();

            return await BuildCreditsResponse(query, page, size);
        }

        public async Task<Credit> GetCreditById(Guid creditId)
        {
            if (creditId == Guid.Empty)
                throw new ArgumentException("CreditId cannot be empty");

            var currentUser = await GetCurrentUserAsync();

            var credit = await _context.Credits
                                       .AsNoTracking()
                                       .FirstOrDefaultAsync(c => c.Id == creditId && c.userId == currentUser.Id);

            if (credit == null)
                throw new KeyNotFoundException("Credit not found");

            return credit;
        }

        public async Task PayCreditById(CreditPaymentRequest request, Guid creditId)
        {
            if (request == null)
                throw new ArgumentException("Request is null");

            if (creditId == Guid.Empty)
                throw new ArgumentException("CreditId cannot be empty");

            if (request.amount <= 0)
                throw new ArgumentException("Payment amount must be greater than zero");

            var currentUser = await GetCurrentUserAsync();

            var credit = await _context.Credits.FirstOrDefaultAsync(c => c.Id == creditId && c.userId == currentUser.Id);
            if (credit == null)
                throw new KeyNotFoundException("Credit not found");

            if (credit.status != StatusCredit.ACTIVE)
                throw new InvalidOperationException("Credit is not active");

            if (request.amount > credit.remainingAmount)
                throw new InvalidOperationException("Payment amount exceeds remaining credit");

            credit.remainingAmount -= request.amount;

            if (credit.remainingAmount <= 0)
                credit.status = StatusCredit.PAID;

            _context.Credits.Update(credit);
            await _context.SaveChangesAsync();
        }

        public async Task<CreditsResponse> GetAllCreditsOfAllUsers(int page, int size)
        {
            ValidatePagination(page, size);
            await EnsureCurrentUserHasBackofficeRoleAsync();

            var query = _context.Credits.AsNoTracking();
            return await BuildCreditsResponse(query, page, size);
        }

        public async Task<CreditTariff> CreateNewTariff(CreateCreditTarrifRequest request)
        {
            if (request == null)
                throw new ArgumentException("Request is null");

            if (string.IsNullOrWhiteSpace(request.name))
                throw new ArgumentException("Tariff name cannot be empty");

            if (request.interestRate <= 0)
                throw new ArgumentException("Interest rate must be greater than zero");

            await EnsureCurrentUserHasBackofficeRoleAsync();

            var tariff = new CreditTariff
            {
                Id = Guid.NewGuid(),
                name = request.name,
                interestRate = request.interestRate,
                minAmount = request.minAmount,
                maxAmount = request.maxAmount,
                minTerm = request.minTerm,
                maxTerm = request.maxTerm,
                status = StatusCredit.ACTIVE
            };

            _context.Tariffs.Add(tariff);
            await _context.SaveChangesAsync();

            return tariff;
        }

        private async Task<CreditsResponse> BuildCreditsResponse(IQueryable<Credit> query, int page, int size)
        {
            int totalElements = await query.CountAsync();
            List<Credit> credits = await query.OrderByDescending(c => c.startDate)
                                     .Skip((page - 1) * size)
                                     .Take(size)
                                     .ToListAsync();

            PageInfo pageInfo = new PageInfo
            {
                page = page,
                size = size,
                totalElements = totalElements,
                totalPages = (int)Math.Ceiling(totalElements / (double)size)
            };

            return new CreditsResponse
            {
                content = credits,
                page = pageInfo
            };
        }

        private async Task<CreditTariffResponse> BuildTariffResponse(IQueryable<CreditTariff> query, int numberPage, int size)
        {
            var totalElements = await query.CountAsync();

            List<CreditTariff> tariffs = await query
                                                .OrderBy(x => x.Id)
                                                .Skip((numberPage - 1) * size)
                                                .Take(size)
                                                .ToListAsync();

            var totalPages = (int)Math.Ceiling(totalElements / (double)size);

            PageInfo pageInfo = new PageInfo
            {
                page = numberPage,
                size = size,
                totalElements = totalElements,
                totalPages = totalPages
            };

            CreditTariffResponse creditTariffResponse = new CreditTariffResponse
            {
                content = tariffs,
                page = pageInfo
            };

            return creditTariffResponse;
        }

        private void ValidatePagination(int page, int size)
        {
            if (page <= 0)
                throw new ArgumentException("Page must be greater than zero");

            if (size <= 0 || size > 100)
                throw new ArgumentException("Size must be between 1 and 100");
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

        private async Task EnsureCurrentUserHasBackofficeRoleAsync()
        {
            var currentUser = await GetCurrentUserAsync();
            if (!string.Equals(currentUser.Role, "ADMIN", StringComparison.OrdinalIgnoreCase)
                && !string.Equals(currentUser.Role, "EMPLOYEE", StringComparison.OrdinalIgnoreCase))
            {
                throw new ForbiddenException("Only admin or employee can access this resource");
            }
        }
    }
}

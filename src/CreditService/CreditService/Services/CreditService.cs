using CreditService.Data;
using CreditService.Data.Responses;
using CreditService.Domain;
using CreditService.Domain.Abstractions;
using CreditService.Domain.Enum;
using CreditService.Domain.Models;
using CreditService.Services.Abstractions;
using CreditService.Services.Models;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Threading;
using UserService.Data;

namespace CreditService.Services
{
    //Начислять кредит на счет.
    //снятие денег с мастер счета
    public class CreditService : ICreditService
    {
        private readonly CreditDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly IUserServiceClient _userServiceClient;
        private readonly ICoreServiceClient _coreServiceClient;
        public readonly Guid _FAILED_CORE = Guid.Parse("00000000-000b-0000-0000-000000000000");
        public readonly Guid MASTER_ACCOUNT = Guid.Parse("99999999-9999-9999-9999-999999999999");

        public CreditService(
            CreditDbContext context,
            IHttpContextAccessor httpContextAccessor,
            IUserServiceClient userServiceClient,
            ICoreServiceClient coreServiceClient)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _httpContextAccessor = httpContextAccessor;
            _userServiceClient = userServiceClient;
            _coreServiceClient = coreServiceClient;
        }

        public async Task<CreditTariffResponse> GetAvailableTarrifs(int page, int size)
        {
            ValidatePagination(page, size);

            var query = _context.Tariffs
                .Where(t => t.status == StatusCredit.ACTIVE)
                .AsNoTracking();

            return await BuildTariffResponse(query, page, size);
        }

        //masterAccount
        public async Task<Credit> ApplyCredit(ApplyForCreditRequest request)//account 
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

            Guid accountId = request.accountId;

            //запрос со снятием денег с мастер счета

            //ФРОНТЕНД - ДОБАВИТЬ ВЫБОР ИМЕЮЩИХСЯ СЧЕТОВ ЧТОБ ОФОРМИТЬ НА НИХ КРЕДИТ

            //if (accountId == _FAILED_CORE)
            //    throw new InvalidOperationException("Account does not exist");

            Guid? isAccountExists = await _coreServiceClient.GetUserAccountAsync(currentUser.Id, accountId, CancellationToken.None);

            if (isAccountExists == null)
            {
                throw new KeyNotFoundException("User's Account does not exists");
            }

            var termMinutes = request.term; // срок в минутах
            var minutesInYear = 60.0; // условный год = 60 минут
            var remainingAmountMoney = request.amount *
                (1 + (tariff.interestRate / 100.0) * (termMinutes / minutesInYear));

            var credit = new Credit
            {
                Id = Guid.NewGuid(),
                userId = currentUser.Id,
                tarrifId = tariff.Id,
                principal = request.amount,
                remainingAmount = remainingAmountMoney,
                interestRate = tariff.interestRate,
                status = StatusCredit.ACTIVE,
                startDate = DateTime.UtcNow,
                endDate = DateTime.UtcNow.AddMinutes(request.term),
                accountId = accountId,
                PaymentFrequencyMinutes = 1,
                LastPaymentDate = DateTime.UtcNow
            };

            bool isPaid = await _coreServiceClient.MasterAccountTransaction(currentUser.Id, accountId, (decimal)credit.principal, MasterDescription.UserTakesCredit.ToString(), CancellationToken.None);
            if (!isPaid)
            {
                throw new InvalidOperationException("Master account transfer was not completed");
            }
            _context.Credits.Add(credit);
            await _context.SaveChangesAsync();

            return credit;
        }

        public async Task<CreditsResponse> GetMyCredits(int page, int size)//check account+
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
        //masterAccount
        private async Task PayCreditById(CreditPaymentRequest request, Guid creditId)//pay need+
        {
            if (request == null)
                throw new ArgumentException("Request is null");

            if (creditId == Guid.Empty)
                throw new ArgumentException("CreditId cannot be empty");

            if (request.amount < 0)
                throw new ArgumentException("Payment amount must be greater than zero");

            var currentUser = await GetCurrentUserAsync();

            var credit = await _context.Credits.FirstOrDefaultAsync(c => c.Id == creditId && c.userId == currentUser.Id);
            if (credit == null)
                throw new KeyNotFoundException("Credit not found");

            if (credit.status != StatusCredit.ACTIVE)
                throw new InvalidOperationException("Credit is not active");

            if (request.amount > credit.remainingAmount)
                //throw new InvalidOperationException("Payment amount exceeds remaining credit");
                request.amount = credit.remainingAmount;

            Guid accountId = await _coreServiceClient.GetUserAccountAsync(currentUser.Id, request.accountId, CancellationToken.None);

            if (accountId == _FAILED_CORE)
                throw new InvalidOperationException("Account does not exist");

            bool isPaid = await _coreServiceClient.PayUserAccountCreditAsync(currentUser.Id, accountId, request.amount, CancellationToken.None);

            if (!isPaid)
            {
                throw new InvalidOperationException("Payment is not possible. Issue in balance or account");
            }

            credit.remainingAmount -= request.amount;

            if (credit.remainingAmount <= 0)
                credit.status = StatusCredit.PAID;

            credit.LastPaymentDate = DateTimeOffset.UtcNow;

            _context.Credits.Update(credit);
            await _context.SaveChangesAsync();
        }
        
        //автоматически списывать только с того счета, который мы указали.
        //иначе уведомлять что какие-то проблемы со счетом
        //продумать то, чтобы привязанный счет было невозможно закрыть.!!!!

        //в фоновом процессе выбрасывать ошибку НЕЛЬЗЯ!
        //добавить в историю транзакций

        //masterAccount
        public async Task AutomaticPayCreditById(Guid creditId, Guid accountId)
        {
            try
            {
                if (creditId == Guid.Empty)
                {
                    return;
                }

                if (accountId == Guid.Empty)
                {
                    return;
                }

                Guid currentUser = await _context.Credits
                    .Where(c => c.Id == creditId)
                    .Select(c => c.userId)
                    .FirstAsync();

                //Guid accountId = await _context.Credits
                //    .Where(c => c.Id == creditId)
                //    .Select(c => c.accountId)
                //    .FirstAsync();

                var credit = await _context.Credits
                    .FirstOrDefaultAsync(c => c.Id == creditId && c.userId == currentUser);

                if (credit == null)
                {
                    return;
                }

                if (credit.status != StatusCredit.ACTIVE)
                {
                    return;
                }

                double amountToPay = credit.principal * (credit.interestRate / 100.0) *
                    ((credit.endDate - credit.startDate).TotalMinutes / 60.0);

                amountToPay = Math.Round(amountToPay, 2, MidpointRounding.AwayFromZero);

                if (amountToPay > credit.remainingAmount)
                    amountToPay = credit.remainingAmount;

                if (amountToPay <= 0)
                {
                    return;
                }

                Guid accountIdAnswer = await _coreServiceClient.GetUserAccountAsync(currentUser, accountId, CancellationToken.None);

                if (accountIdAnswer == _FAILED_CORE)
                {
                    return;
                }

                bool isPaid = await _coreServiceClient.MasterAccountTransaction(currentUser, accountId, (decimal)amountToPay, MasterDescription.UserPaysCredit.ToString(), CancellationToken.None);

                if (!isPaid)
                {
                    return;
                }

                credit.remainingAmount -= amountToPay;
                credit.remainingAmount = Math.Round(credit.remainingAmount, 2, MidpointRounding.AwayFromZero);

                if (credit.remainingAmount <= 0)
                    credit.status = StatusCredit.PAID;

                _context.Credits.Update(credit);

                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"AutomaticPayCreditById failed. CreditId = {creditId}\nAccountId = {accountId}\n");
            }

        }

        public async Task<CreditsResponse> GetAllCreditsOfAllUsers(int page, int size)
        {
            ValidatePagination(page, size);
            await EnsureCurrentUserHasBackofficeRoleAsync();

            var query = _context.Credits.AsNoTracking();
            return await BuildCreditsResponse(query, page, size);
        }

        public async Task<DelinquenciesResponse> GetMyDelinquencies(int page, int size)
        {
            ValidatePagination(page, size);
            var currentUser = await GetCurrentUserAsync();

            var query = _context.Credits
                .AsNoTracking()
                .Where(x => x.userId == currentUser.Id && (x.status == StatusCredit.OVERDUE || x.status == StatusCredit.DEFAULTED));

            return await BuildDelinquenciesResponse(query, page, size);
        }

        public async Task<DelinquenciesResponse> GetAllDelinquencies(int page, int size)
        {
            ValidatePagination(page, size);
            await EnsureCurrentUserHasBackofficeRoleAsync();

            var query = _context.Credits
                .AsNoTracking()
                .Where(x => x.status == StatusCredit.OVERDUE || x.status == StatusCredit.DEFAULTED);

            return await BuildDelinquenciesResponse(query, page, size);
        }

        public async Task<CreditRatingResponse> GetMyCreditRating()
        {
            var currentUser = await GetCurrentUserAsync();
            return await BuildCreditRatingAsync(currentUser.Id);
        }

        public async Task<CreditRatingResponse> GetCreditRatingByUser(Guid userId)
        {
            await EnsureCurrentUserHasBackofficeRoleAsync();
            return await BuildCreditRatingAsync(userId);
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

        private async Task<DelinquenciesResponse> BuildDelinquenciesResponse(IQueryable<Credit> query, int page, int size)
        {
            var totalElements = await query.CountAsync();
            var credits = await query
                .OrderByDescending(x => x.endDate)
                .Skip((page - 1) * size)
                .Take(size)
                .ToListAsync();

            var content = credits
                .Select(x => new DelinquencyResponse
                {
                    CreditId = x.Id,
                    UserId = x.userId,
                    AccountId = x.accountId,
                    DueDate = x.endDate,
                    RemainingAmount = x.remainingAmount,
                    DaysOverdue = Math.Max(0, (int)Math.Floor((DateTimeOffset.UtcNow - x.endDate).TotalDays)),
                    Status = x.status
                })
                .ToArray();

            return new DelinquenciesResponse
            {
                Content = content,
                Page = new PageInfo
                {
                    page = page,
                    size = size,
                    totalElements = totalElements,
                    totalPages = (int)Math.Ceiling(totalElements / (double)size)
                }
            };
        }

        private async Task<CreditRatingResponse> BuildCreditRatingAsync(Guid userId)
        {
            var credits = await _context.Credits
                .AsNoTracking()
                .Where(x => x.userId == userId)
                .ToListAsync();

            var total = credits.Count;
            var paid = credits.Count(x => x.status == StatusCredit.PAID);
            var active = credits.Count(x => x.status == StatusCredit.ACTIVE);
            var overdue = credits.Count(x => x.status == StatusCredit.OVERDUE);
            var defaulted = credits.Count(x => x.status == StatusCredit.DEFAULTED);

            var probability = 0.5d;
            if (total > 0)
            {
                probability = (paid + 0.5d * active + 0.25d * overdue) / total;
            }

            probability -= defaulted * 0.1d;
            probability = Math.Max(0.01d, Math.Min(0.99d, probability));

            return new CreditRatingResponse
            {
                UserId = userId,
                RepaymentProbability = Math.Round(probability, 4, MidpointRounding.AwayFromZero),
                ActiveCredits = active,
                PaidCredits = paid,
                OverdueCredits = overdue,
                DefaultedCredits = defaulted,
                CalculatedAt = DateTimeOffset.UtcNow
            };
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

using CreditService.Data.Responses;
using CreditService.Domain;
using CreditService.Domain.Abstractions;
using CreditService.Domain.Enum;
using CreditService.Domain.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using UserService.Data;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace CreditService.Services
{
    public class CreditService : ICreditService
    {
        private readonly CreditDbContext _context;

        public CreditService(CreditDbContext context)
        {
            _context = context;
        }

        public async Task<CreditTariffResponse> GetAvailableTarrifs(int page, int size)
        {
            page = page <= 0 ? 1 : page;
            size = size <= 0 ? 10 : size;

            IQueryable<CreditTariff> query = _context.Tariffs
                                                        .Where(t => t.status == StatusCredit.ACTIVE)
                                                        .AsNoTracking();




            return await createCreditTariffResponse(query, page, size);

        }

        private async Task<CreditTariffResponse> createCreditTariffResponse(IQueryable<CreditTariff> query, int numberPage, int size)
        {

            List<CreditTariff> tariffs = await query
                                                .OrderBy(x => x.Id)
                                                .Skip((numberPage - 1) * size)
                                                .Take(size)
                                                .ToListAsync();

            var totalPages = (int)Math.Ceiling(tariffs.Count() / (double)size);

            List<CreditTariff> creditTariff = await _context.Tariffs.Where(tariff => tariff.status == StatusCredit.ACTIVE).ToListAsync();
            var total = await query.CountAsync();

            PageInfo pageInfo = new PageInfo
            {
                page = numberPage,
                size = size,
                totalElements = tariffs.Count(),
                totalPages = totalPages
            };

            CreditTariffResponse creditTariffResponse = new CreditTariffResponse
            {
                content = creditTariff,
                page = pageInfo
            };

            return creditTariffResponse;
        }
    }
}

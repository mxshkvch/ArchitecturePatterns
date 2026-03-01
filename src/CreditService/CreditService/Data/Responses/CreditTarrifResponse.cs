using CreditService.Domain;
using CreditService.Domain.Models;

namespace CreditService.Data.Responses
{
    public class CreditTariffResponse
    {
        public List<CreditTariff> content { get; set; }
        public PageInfo page { get; set; }
    }
}

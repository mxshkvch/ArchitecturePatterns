using CreditService.Domain;
using CreditService.Domain.Models;

namespace CreditService.Data.Responses
{
    public class CreditTarrifResponse
    {
        public List<CreditTariff> content { get; set; }
        public PageInfo page { get; set; }
    }
}

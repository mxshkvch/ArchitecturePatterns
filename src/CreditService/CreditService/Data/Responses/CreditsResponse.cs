using CreditService.Domain;
using CreditService.Domain.Models;

namespace CreditService.Data.Responses
{
    public class CreditsResponse
    {
        public List<Credit> content { get; set; }
        public PageInfo page { get; set; }

    }
}

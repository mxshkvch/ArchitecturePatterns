namespace CreditService.Domain.Models
{
    public class ApplyForCreditRequest
    {
        public Guid tariffId { get; set; }
        public Guid accountId { get; set; }
        public int amount { get; set; }
        public int term { get; set; }
    }
}

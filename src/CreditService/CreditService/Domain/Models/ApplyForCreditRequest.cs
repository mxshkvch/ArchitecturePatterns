namespace CreditService.Domain.Models
{
    public class ApplyForCreditRequest
    {
        public Guid tarrifId { get; set; }
        public int amount { get; set; }
        public int term { get; set; }
    }
}

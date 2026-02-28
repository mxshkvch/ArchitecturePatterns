namespace CreditService.Domain.Models
{
    public class CreditPaymentRequest
    {
        public Guid accountId { get; set; }
        public double amount { get; set; }
    }
}

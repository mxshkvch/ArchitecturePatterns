using CreditService.Domain.Enum;

namespace CreditService.Domain
{
    public class Credit
    {
        public Guid Id { get; set; }
        public Guid userId { get; set; }
        public Guid accountId { get; set; }
        public Guid tarrifId { get; set; }
        public double principal {  get; set; }
        public double remainingAmount { get; set; }
        public float interestRate { get; set; }
        public DateTimeOffset startDate { get; set; }
        public DateTimeOffset endDate { get; set; }
        public StatusCredit status { get; set; }
        public int PaymentFrequencyMinutes { get; set; }
        public DateTimeOffset? LastPaymentDate { get; set; }
    }
}

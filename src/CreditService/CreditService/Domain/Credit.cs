using CreditService.Domain.Enum;

namespace CreditService.Domain
{
    public class Credit
    {
        public Guid Id { get; set; }
        public Guid userId { get; set; }
        public Guid accountId { get; set; }
        public Guid tarrifId { get; set; }
        public double principal {  get; set; }//1начальная сумма долга
        public double remainingAmount { get; set; }//осталось погасить
        public float interestRate { get; set; }
        public DateTimeOffset startDate { get; set; }
        public DateTimeOffset endDate { get; set; }
        public StatusCredit status { get; set; }

    }
}

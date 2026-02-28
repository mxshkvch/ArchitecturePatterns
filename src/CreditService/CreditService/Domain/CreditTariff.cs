using CreditService.Domain.Enum;

namespace CreditService.Domain
{
    public class CreditTariff
    {
        public Guid Id { get; set; }
        public string name { get; set; }
        public float interestRate { get; set; }
        public double minAmount { get; set; }
        public double maxAmount { get; set; }
        public int minTerm { get; set; }
        public int maxTerm { get; set; }
        public StatusCredit status { get; set; }

    }
}

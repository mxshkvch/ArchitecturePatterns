namespace CreditService.Domain.Models
{
    public class CreateCreditTarrifRequest
    {
        public string name { get; set; }
        public int interestRate { get; set; }
        public double minAmount { get; set; }
        public double maxAmount { get; set; }
        public int minTerm { get; set; }
        public int maxTerm { get; set; }


    }
}

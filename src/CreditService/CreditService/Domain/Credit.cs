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
        public StatusCredit status { get; set; }    //если будет StatusCredit.PAID то это в плюс к кредитной истории
        public int failedPaymentsAmount { get; set; }//счетчик для кредитной истории
                                                    //в dotnet database обновление залить
                                                    //прибавлять это количество в юзера
    }
}

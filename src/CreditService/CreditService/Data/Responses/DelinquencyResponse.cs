using CreditService.Domain.Enum;

namespace CreditService.Data.Responses;

public sealed class DelinquencyResponse
{
    public Guid CreditId { get; set; }
    public Guid UserId { get; set; }
    public Guid AccountId { get; set; }
    public DateTimeOffset DueDate { get; set; }
    public double RemainingAmount { get; set; }
    public int DaysOverdue { get; set; }
    public StatusCredit Status { get; set; }
}

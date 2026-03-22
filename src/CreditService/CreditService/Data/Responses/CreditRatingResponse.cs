namespace CreditService.Data.Responses;

public sealed class CreditRatingResponse
{
    public Guid UserId { get; set; }
    public double RepaymentProbability { get; set; }
    public int ActiveCredits { get; set; }
    public int PaidCredits { get; set; }
    public int OverdueCredits { get; set; }
    public int DefaultedCredits { get; set; }
    public DateTimeOffset CalculatedAt { get; set; }
}

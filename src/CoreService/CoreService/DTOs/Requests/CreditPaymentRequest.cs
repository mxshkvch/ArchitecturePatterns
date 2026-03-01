namespace CoreService.DTOs.Requests;

public class CreditPaymentRequest
{
    public Guid AccountId { get; set; }
    public decimal Amount { get; set; }
}
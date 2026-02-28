namespace CoreService.DTOs.Requests;

public class ApplyForCreditRequest
{
    public Guid TariffId { get; set; }
    public decimal Amount { get; set; }
    public int Term { get; set; }
}
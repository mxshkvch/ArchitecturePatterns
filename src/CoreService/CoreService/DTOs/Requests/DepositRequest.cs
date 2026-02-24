namespace CoreService.DTOs.Requests;

public class DepositRequest
{
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
}
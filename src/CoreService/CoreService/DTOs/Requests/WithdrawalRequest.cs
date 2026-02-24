namespace CoreService.DTOs.Requests;

public class WithdrawalRequest
{
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
}
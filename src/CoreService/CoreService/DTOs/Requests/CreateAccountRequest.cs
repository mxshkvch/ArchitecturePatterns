using CoreService.Enums;

namespace CoreService.DTOs.Requests;

public class CreateAccountRequest
{
    public Currency Currency { get; set; }
    public decimal InitialDeposit { get; set; }
}
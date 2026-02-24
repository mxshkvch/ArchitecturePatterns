namespace CoreService.DTOs.Requests;

public class CreateCreditTariffRequest
{
    public string Name { get; set; } = string.Empty;
    public decimal InterestRate { get; set; }
    public decimal MinAmount { get; set; }
    public decimal MaxAmount { get; set; }
    public int MinTerm { get; set; }
    public int MaxTerm { get; set; }
}
using CoreService.Enums;

namespace CoreService.Entities;

public class CreditTariff
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal InterestRate { get; set; }
    public decimal MinAmount { get; set; }
    public decimal MaxAmount { get; set; }
    public int MinTerm { get; set; }
    public int MaxTerm { get; set; }
    public TariffStatus Status { get; set; }
}
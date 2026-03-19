namespace CoreService.DTOs.Responses;

public sealed class ExchangeRatesResponse
{
    public Dictionary<string, decimal> Rates { get; set; } = new(StringComparer.OrdinalIgnoreCase);
}

namespace CoreService.Configurations;

public sealed class ExchangeRateOptions
{
    public string BaseUrl { get; set; } = "https://api.frankfurter.dev";
    public int CacheMinutes { get; set; } = 30;
}

namespace CoreService.Configurations;

public sealed class ExchangeRateOptions
{
    public string BaseUrl { get; set; } = "https://open.er-api.com";
    public int CacheMinutes { get; set; } = 30;
}

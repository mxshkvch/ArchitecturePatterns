using CoreService.Abstractions;
using CoreService.Configurations;
using CoreService.Enums;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace CoreService.Services;

public sealed class ExchangeRateService(
    HttpClient httpClient,
    IMemoryCache memoryCache,
    IOptions<ExchangeRateOptions> options) : IExchangeRateService
{
    public async Task<decimal> GetRateAsync(Currency from, Currency to, CancellationToken cancellationToken)
    {
        if (from == to)
        {
            return 1m;
        }

        var cacheKey = $"fx:{from}:{to}";
        if (memoryCache.TryGetValue<decimal>(cacheKey, out var cachedRate))
        {
            return cachedRate;
        }

        var requestUri = $"/v6/latest/{from}";
        var response = await httpClient.GetFromJsonAsync<ExchangeRatesApiResponse>(requestUri, cancellationToken)
            ?? throw new InvalidOperationException("Exchange rate response is empty");

        if (!response.Rates.TryGetValue(to.ToString(), out var rate) || rate <= 0)
        {
            throw new InvalidOperationException($"Exchange rate for {from}->{to} is unavailable");
        }

        memoryCache.Set(cacheKey, rate, TimeSpan.FromMinutes(Math.Max(1, options.Value.CacheMinutes)));

        return rate;
    }

    private sealed class ExchangeRatesApiResponse
    {
        public Dictionary<string, decimal> Rates { get; set; } = new();
    }
}

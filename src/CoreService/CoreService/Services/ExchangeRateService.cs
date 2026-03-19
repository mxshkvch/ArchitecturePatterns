using CoreService.Abstractions;
using CoreService.Configurations;
using CoreService.DTOs.Responses;
using CoreService.Enums;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;

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

        var requestUri = $"/v1/latest?base={from}&symbols={to}";
        var response = await httpClient.GetFromJsonAsync<ExchangeRatesResponse>(requestUri, cancellationToken)
            ?? throw new InvalidOperationException("Exchange rate response is empty");

        if (!response.Rates.TryGetValue(to.ToString(), out var rate) || rate <= 0)
        {
            throw new InvalidOperationException($"Exchange rate for {from}->{to} is unavailable");
        }

        memoryCache.Set(cacheKey, rate, TimeSpan.FromMinutes(Math.Max(1, options.Value.CacheMinutes)));

        return rate;
    }
}

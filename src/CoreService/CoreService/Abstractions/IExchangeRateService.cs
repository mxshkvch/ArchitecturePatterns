using CoreService.Enums;

namespace CoreService.Abstractions;

public interface IExchangeRateService
{
    Task<decimal> GetRateAsync(Currency from, Currency to, CancellationToken cancellationToken);
}

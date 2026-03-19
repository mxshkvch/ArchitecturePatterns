using CreditService.Domain.Models;

namespace CreditService.Data.Responses;

public sealed class DelinquenciesResponse
{
    public IReadOnlyCollection<DelinquencyResponse> Content { get; set; } = Array.Empty<DelinquencyResponse>();
    public PageInfo Page { get; set; } = new PageInfo();
}

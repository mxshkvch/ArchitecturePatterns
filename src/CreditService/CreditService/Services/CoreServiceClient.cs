using CreditService.Data.Responses;
using CreditService.Services.Abstractions;
using System.Net;
using System.Net.Http.Headers;

namespace CreditService.Services;

public sealed class CoreServiceClient(HttpClient httpClient, IServiceTokenProvider serviceTokenProvider) : ICoreServiceClient
{
    public async Task<Guid> GetUserAccountAsync(Guid userId, Guid accountId, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, $"internal/core/{userId}/account/{accountId}");
        request.Headers.Authorization = await CreateAuthorizationHeaderAsync(cancellationToken);

        using var response = await httpClient.SendAsync(request, cancellationToken);

        try
        {
            response.EnsureSuccessStatusCode();
        }
        catch (HttpRequestException)
        {
            var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException(errorContent, null, response.StatusCode);
        }

        var account = await response.Content.ReadFromJsonAsync<UserAccountResponse>(cancellationToken);

        return account?.AccountId
            ?? Guid.Parse("00000000-000b-0000-0000-000000000000");
    }

    public async Task<bool> PayUserAccountCreditAsync(Guid userId, Guid accountId, double paymentAmount, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, $"internal/core/{userId}/account/pay?accountId={accountId}&paymentAmount={paymentAmount}");
        request.Headers.Authorization = await CreateAuthorizationHeaderAsync(cancellationToken);

        using var response = await httpClient.SendAsync(request, cancellationToken);

        var isPaid = response.StatusCode == HttpStatusCode.OK;

        return isPaid;
    }

    public async Task<bool> DepostUserAccountAfterApplyAsync(Guid userId, Guid accountId, double paymentAmount, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, $"internal/core/{userId}/account/creditDeposit?accountId={accountId}&paymentAmount={paymentAmount}");
        request.Headers.Authorization = await CreateAuthorizationHeaderAsync(cancellationToken);

        using var response = await httpClient.SendAsync(request, cancellationToken);

        response.EnsureSuccessStatusCode();

        return response.StatusCode == HttpStatusCode.OK;
    }

    public async Task<bool> MasterAccountTransaction(Guid userId, Guid toAccountId, decimal paymentAmount, string description, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, $"internal/core/{userId}/masterAccount/{toAccountId}?paymentAmount={paymentAmount}&description={description}");
        request.Headers.Authorization = await CreateAuthorizationHeaderAsync(cancellationToken);

        using var response = await httpClient.SendAsync(request, cancellationToken);

        response.EnsureSuccessStatusCode();

        return response.StatusCode == HttpStatusCode.OK;
    }

    public async Task AddTransactionPayment(Guid userId, Guid accountId, double paymentAmount, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, $"internal/core/{userId}/account/creditTransaction?accountId={accountId}&paymentAmount={paymentAmount}");
        request.Headers.Authorization = await CreateAuthorizationHeaderAsync(cancellationToken);

        using var response = await httpClient.SendAsync(request, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
            throw new HttpRequestException($"Failed to add transaction: {errorContent}", null, response.StatusCode);
        }
    }

    private async Task<AuthenticationHeaderValue> CreateAuthorizationHeaderAsync(CancellationToken cancellationToken)
    {
        var accessToken = await serviceTokenProvider.GetAccessTokenAsync(cancellationToken);
        return new AuthenticationHeaderValue("Bearer", accessToken);
    }
}

using CreditService.Data.Responses;
using CreditService.Services.Abstractions;
using Microsoft.AspNetCore.Http;
using System.Net;
using System.Net.Http;

namespace CreditService.Services
{
    public class CoreServiceClient(HttpClient httpClient, IHttpContextAccessor httpContextAccessor) : ICoreServiceClient
    {
        public async Task<Guid> GetUserAccountAsync(Guid userId, Guid accountId, CancellationToken cancellationToken)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, $"internal/core/{userId}/account/{accountId}");

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

            UserAccountResponse? account = await response.Content.ReadFromJsonAsync<UserAccountResponse>(cancellationToken);

            return account?.AccountId
                ?? Guid.Parse("00000000-000b-0000-0000-000000000000");
        }

        public async Task<bool> PayUserAccountCreditAsync(Guid userId, Guid accountId, double paymentAmount, CancellationToken cancellationToken)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, $"internal/core/{userId}/account/pay?accountId={accountId}&paymentAmount={paymentAmount}");

            var authorization = httpContextAccessor.HttpContext?.Request.Headers.Authorization.ToString();
            if (!string.IsNullOrWhiteSpace(authorization))
            {
                request.Headers.TryAddWithoutValidation("Authorization", authorization);
            }

            using var response = await httpClient.SendAsync(request, cancellationToken);

            //response.EnsureSuccessStatusCode();

            var isPaid = response.StatusCode == HttpStatusCode.OK;

            return isPaid;
        }

        public async Task<bool> DepostUserAccountAfterApplyAsync(Guid userId, Guid accountId, double paymentAmount, CancellationToken cancellationToken)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, $"internal/core/{userId}/account/creditDeposit?accountId={accountId}&paymentAmount={paymentAmount}");

            using var response = await httpClient.SendAsync(request, cancellationToken);

            response.EnsureSuccessStatusCode();

            var isPaid = response.StatusCode == HttpStatusCode.OK;


            return isPaid;
        }

        public async Task AddTransactionPayment(Guid userId, Guid accountId, double paymentAmount, CancellationToken cancellationToken)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, $"internal/core/{userId}/account/creditTransaction?accountId={accountId}&paymentAmount={paymentAmount}");

            using var response = await httpClient.SendAsync(request, cancellationToken);

            if(!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                throw new HttpRequestException($"Failed to add transaction: {errorContent}", null, response.StatusCode);
            }
        }
    }
}

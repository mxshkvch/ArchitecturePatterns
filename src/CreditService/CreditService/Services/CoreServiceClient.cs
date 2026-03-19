using CreditService.Data.Responses;
using CreditService.Domain.Models;
using CreditService.Services.Abstractions;
using CreditService.Services.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;

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

        //credit master
        public async Task<IsPaidAndAccountResponse> MasterAccountTransaction(Guid userId, Guid toAccountId, decimal paymentAmount, string description, CancellationToken cancellationToken)
        {
            using var request = new HttpRequestMessage(HttpMethod.Post, $"internal/core/{userId}/masterAccount/{toAccountId}?paymentAmount={paymentAmount}&description={description}");

            using var response = await httpClient.SendAsync(request, cancellationToken);

            response.EnsureSuccessStatusCode();
            
            var content = await response.Content.ReadAsStringAsync(cancellationToken);

            //if (content.Contains("\"closedAt\""))
            //{
            //    content = content.Replace("\"closedAt\":null", "\"closedAt\":\"null\"");
            //}

            var accountResponse = JsonSerializer.Deserialize<AccountResponse>(
                content,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    // Для enum строкового формата, если нужно
                    Converters = { new JsonStringEnumConverter() }
                });

            bool isPaid;

            if (accountResponse.transactionType == TransactionType.CREDIT_OVERDUE_PAYMENT)
            {
                isPaid = false;
            }


            isPaid = response.StatusCode == HttpStatusCode.OK;

            IsPaidAndAccountResponse isPaidAndAccountResponse = new IsPaidAndAccountResponse
            {
                isPaid = isPaid,
                accountResponse = accountResponse
            };

            return isPaidAndAccountResponse;
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

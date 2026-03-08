using CreditService.Data.Responses;
using CreditService.Services.Abstractions;
using Microsoft.AspNetCore.Http;
using System.Net;
using System.Net.Http;

namespace CreditService.Services
{
    public class CoreServiceClient(HttpClient httpClient, IHttpContextAccessor httpContextAccessor) : ICoreServiceClient
    {
        public async Task<Guid> GetUserAccountAsync(Guid userId, CancellationToken cancellationToken)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, $"internal/core/{userId}/account");

            var authorization = httpContextAccessor.HttpContext?.Request.Headers.Authorization.ToString();
            if (!string.IsNullOrWhiteSpace(authorization))
            {
                request.Headers.TryAddWithoutValidation("Authorization", authorization);
            }

            using var response = await httpClient.SendAsync(request, cancellationToken);

            response.EnsureSuccessStatusCode();

            var account = await response.Content.ReadFromJsonAsync<UserAccountResponse>(cancellationToken);

            return account?.AccountId
                ?? Guid.Parse("00000000-000b-0000-0000-000000000000");
        }
    }
}

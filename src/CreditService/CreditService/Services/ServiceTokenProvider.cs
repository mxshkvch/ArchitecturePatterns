using CreditService.Services.Abstractions;
using CreditService.Services.Models;
using Microsoft.Extensions.Caching.Memory;

namespace CreditService.Services;

public sealed class ServiceTokenProvider(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    IMemoryCache memoryCache) : IServiceTokenProvider
{
    private const string CacheKey = "credit-service-access-token";

    public async Task<string> GetAccessTokenAsync(CancellationToken cancellationToken)
    {
        if (memoryCache.TryGetValue<string>(CacheKey, out var cachedToken) && !string.IsNullOrWhiteSpace(cachedToken))
        {
            return cachedToken;
        }

        var authServiceUrl = configuration["Services:AuthServiceUrl"]
            ?? throw new ArgumentException("Services:AuthServiceUrl cannot be null");
        var clientId = configuration["OAuth:ClientId"]
            ?? throw new ArgumentException("OAuth:ClientId cannot be null");
        var clientSecret = configuration["OAuth:ClientSecret"]
            ?? throw new ArgumentException("OAuth:ClientSecret cannot be null");

        var httpClient = httpClientFactory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Post, $"{authServiceUrl.TrimEnd('/')}/connect/token")
        {
            Content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["grant_type"] = "client_credentials",
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret
            })
        };

        using var response = await httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        var tokenPayload = await response.Content.ReadFromJsonAsync<OAuthTokenResponse>(cancellationToken);
        if (tokenPayload == null || string.IsNullOrWhiteSpace(tokenPayload.AccessToken))
        {
            throw new InvalidOperationException("AuthService returned empty service token payload");
        }

        var ttl = Math.Max(30, tokenPayload.ExpiresIn - 60);
        memoryCache.Set(CacheKey, tokenPayload.AccessToken, TimeSpan.FromSeconds(ttl));

        return tokenPayload.AccessToken;
    }
}

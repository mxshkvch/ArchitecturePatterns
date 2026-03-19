using CreditService.Services.Abstractions;
using System.Net;
using System.Net.Http.Headers;

namespace CreditService.Services;

public sealed class UserServiceClient(HttpClient httpClient, IServiceTokenProvider serviceTokenProvider) : IUserServiceClient
{
    public async Task<UserAccessResponse> GetUserAccessAsync(Guid userId, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, $"internal/users/{userId}/access");
        request.Headers.Authorization = await CreateAuthorizationHeaderAsync(cancellationToken);

        using var response = await httpClient.SendAsync(request, cancellationToken);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            throw new KeyNotFoundException("User not found");
        }

        if (response.StatusCode == HttpStatusCode.Unauthorized)
        {
            throw new UnauthorizedAccessException("User is not authenticated");
        }

        response.EnsureSuccessStatusCode();

        var userAccess = await response.Content.ReadFromJsonAsync<UserAccessResponse>(cancellationToken);
        return userAccess ?? throw new InvalidOperationException("UserService returned empty user access payload");
    }
    public async Task<List<UserAccessResponse>> GetAllUsers(CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, $"internal/users/all");
        request.Headers.Authorization = await CreateAuthorizationHeaderAsync(cancellationToken);

        using var response = await httpClient.SendAsync(request, cancellationToken);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            throw new KeyNotFoundException("Users not found");
        }

        response.EnsureSuccessStatusCode();

        var userAccess = await response.Content.ReadFromJsonAsync<List<UserAccessResponse>>(cancellationToken);
        return userAccess ?? throw new InvalidOperationException("UserService returned empty user access payload");
    }

    public async Task<int> ChangeCreditHistory(Guid userId, int amount, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Patch, $"internal/users/{userId}/creditHistory?amount={amount}");
        request.Headers.Authorization = await CreateAuthorizationHeaderAsync(cancellationToken);

        using var response = await httpClient.SendAsync(request, cancellationToken);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            throw new KeyNotFoundException("User not found");
        }

        response.EnsureSuccessStatusCode();

        var updatedHistory = await response.Content.ReadFromJsonAsync<int>(cancellationToken);
        return updatedHistory;
    }

    public async Task<int> GetCreditHistory(Guid userId, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, $"internal/users/{userId}/creditHistory");
        request.Headers.Authorization = await CreateAuthorizationHeaderAsync(cancellationToken);

        using var response = await httpClient.SendAsync(request, cancellationToken);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            throw new KeyNotFoundException("User not found");
        }

        response.EnsureSuccessStatusCode();

        var history = await response.Content.ReadFromJsonAsync<int>(cancellationToken);
        return history;
    }

    private async Task<AuthenticationHeaderValue> CreateAuthorizationHeaderAsync(CancellationToken cancellationToken)
    {
        var accessToken = await serviceTokenProvider.GetAccessTokenAsync(cancellationToken);
        return new AuthenticationHeaderValue("Bearer", accessToken);
    }
}

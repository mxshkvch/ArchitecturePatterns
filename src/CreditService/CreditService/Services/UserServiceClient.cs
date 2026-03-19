using CreditService.Services.Abstractions;
using System.Net;

namespace CreditService.Services;

public sealed class UserServiceClient(HttpClient httpClient, IServiceTokenProvider serviceTokenProvider) : IUserServiceClient
{
    public async Task<UserAccessResponse> GetUserAccessAsync(Guid userId, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, $"internal/users/{userId}/access");
        var accessToken = await serviceTokenProvider.GetAccessTokenAsync(cancellationToken);
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

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
        var accessToken = await serviceTokenProvider.GetAccessTokenAsync(cancellationToken);
        request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

        using var response = await httpClient.SendAsync(request, cancellationToken);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            throw new KeyNotFoundException("Users not found");
        }

        response.EnsureSuccessStatusCode();

        var userAccess = await response.Content.ReadFromJsonAsync<List<UserAccessResponse>>(cancellationToken);
        return userAccess ?? throw new InvalidOperationException("UserService returned empty user access payload");
    }
}

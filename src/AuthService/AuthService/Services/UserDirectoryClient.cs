using AuthService.Abstractions;
using AuthService.DTOs.Requests;
using System.Net.Http.Headers;

namespace AuthService.Services;

public sealed class UserDirectoryClient(HttpClient httpClient) : IUserDirectoryClient
{
    public async Task CreateUserProfileAsync(CreateUserProfileRequest request, string bearerToken, CancellationToken cancellationToken)
    {
        using var message = new HttpRequestMessage(HttpMethod.Post, "internal/users/profiles")
        {
            Content = JsonContent.Create(request)
        };

        message.Headers.Authorization = new AuthenticationHeaderValue("Bearer", bearerToken);

        using var response = await httpClient.SendAsync(message, cancellationToken);
        response.EnsureSuccessStatusCode();
    }
}

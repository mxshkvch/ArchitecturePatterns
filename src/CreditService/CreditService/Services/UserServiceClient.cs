using CreditService.Services.Abstractions;
using Microsoft.AspNetCore.Http;
using System.Net;
using System.Net.Http.Headers;

namespace CreditService.Services;

public sealed class UserServiceClient(HttpClient httpClient, IHttpContextAccessor httpContextAccessor) : IUserServiceClient
{
    public async Task<UserAccessResponse> GetUserAccessAsync(Guid userId, CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, $"internal/users/{userId}/access");

        var authorization = httpContextAccessor.HttpContext?.Request.Headers.Authorization.ToString();
        if (!string.IsNullOrWhiteSpace(authorization))
        {
            request.Headers.TryAddWithoutValidation("Authorization", authorization);
        }

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
}

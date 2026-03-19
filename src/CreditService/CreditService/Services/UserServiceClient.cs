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
    public async Task<List<UserAccessResponse>> GetAllUsers(CancellationToken cancellationToken)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, $"internal/users/all");

        using var response = await httpClient.SendAsync(request, cancellationToken);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            throw new KeyNotFoundException("Users not found");
        }

        response.EnsureSuccessStatusCode();

        var userAccess = await response.Content.ReadFromJsonAsync<List<UserAccessResponse>>(cancellationToken);
        return userAccess ?? throw new InvalidOperationException("UserService returned empty user access payload");
    }

    public async Task<int> ChangeCreditHistory(Guid userId, int amount, CancellationToken cancellationToken)//протестировать
    {
        using var request = new HttpRequestMessage(HttpMethod.Patch, $"internal/users/{userId}/creditHistory?amount={amount}");

        using var response = await httpClient.SendAsync(request, cancellationToken);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            throw new KeyNotFoundException("userCreditHistory not found");
        }

        response.EnsureSuccessStatusCode();

        int? creditHistory = await response.Content.ReadFromJsonAsync<int>(cancellationToken);
        return creditHistory ?? throw new InvalidOperationException("UserService returned not valid creditHistory");
    }

    public async Task<int> GetCreditHistory(Guid userId, CancellationToken cancellationToken)//протестировать
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, $"internal/users/{userId}/creditHistory");

        using var response = await httpClient.SendAsync(request, cancellationToken);

        if (response.StatusCode == HttpStatusCode.NotFound)
        {
            throw new KeyNotFoundException("userCreditHistory not found");
        }

        response.EnsureSuccessStatusCode();

        int? creditHistory = await response.Content.ReadFromJsonAsync<int>(cancellationToken);
        return creditHistory ?? throw new InvalidOperationException("UserService returned not valid creditHistory");
    }
}

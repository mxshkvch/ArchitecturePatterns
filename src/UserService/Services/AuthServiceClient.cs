using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using UserService.Contracts.Common.Abstractions;
using UserService.Contracts.Requests;
using UserService.Contracts.Responses;
using UserService.Domain;

namespace UserService.Services
{
    public class AuthServiceClient : IAuthServiceClient
    {
        private readonly HttpClient _httpClient;

        public AuthServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        public async Task<RegisterResponse> RegisterUserAsync(RegisterClientRequest request)
        {
            var response = await _httpClient.PostAsJsonAsync("api/auth/register", request);

            response.EnsureSuccessStatusCode();

            RegisterResponse? result = await response.Content.ReadFromJsonAsync<RegisterResponse>();

            if (result == null) throw new InvalidOperationException("AuthService вернул пустой ответ");

            return result;
        }
    }
}

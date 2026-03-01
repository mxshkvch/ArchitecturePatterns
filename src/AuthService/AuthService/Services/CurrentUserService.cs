using System.Security.Claims;
using AuthService.Abstractions;
using AuthService.DTos.Requests;

namespace AuthService.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly HttpClient _httpClient;


    public CurrentUserService(IHttpContextAccessor httpContextAccessor, HttpClient httpClient)
    {
        _httpContextAccessor = httpContextAccessor;
        _httpClient = httpClient;
    }

    public Guid GetUserId()
    {
        string? idClaim = _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return idClaim != null ? Guid.Parse(idClaim) : Guid.Empty;
    }

    public string GetUserRole()
    {
        return _httpContextAccessor.HttpContext?.User?.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
    }

    public async Task CreateUserAsync(CreateUserAdminRequest request)
    {
        var response = await _httpClient.PostAsJsonAsync("internal/users", request);
        response.EnsureSuccessStatusCode();
    }


}

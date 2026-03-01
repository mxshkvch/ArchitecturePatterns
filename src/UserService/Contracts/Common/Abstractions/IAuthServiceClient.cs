using UserService.Contracts.Requests;
using UserService.Contracts.Responses;
using UserService.Domain;
using UserService.Services;

namespace UserService.Contracts.Common.Abstractions
{
    public interface IAuthServiceClient
    {
        Task<RegisterResponse> RegisterUserAsync(RegisterClientRequest request);
    }
}

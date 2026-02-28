using CoreService.DTOs.Requests;
using CoreService.DTOs.Responses;

namespace CoreService.Abstractions;

public interface ICreditService
{
    Task<PagedResponse<CreditTariffResponse>> GetTariffsAsync(int page, int size);
    Task<CreditTariffResponse> CreateTariffAsync(CreateCreditTariffRequest request);
    Task<CreditResponse> ApplyForCreditAsync(Guid userId, ApplyForCreditRequest request);
    Task<PagedResponse<CreditResponse>> GetMyCreditsAsync(Guid userId, int page, int size);
    Task<CreditResponse> GetCreditAsync(Guid creditId, Guid userId, bool isAdmin);
    Task PayCreditAsync(Guid creditId, Guid userId, CreditPaymentRequest request);
    Task<PagedResponse<CreditResponse>> GetAllCreditsAsync(int page, int size);
}
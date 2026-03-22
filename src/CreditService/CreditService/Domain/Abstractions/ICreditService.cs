using CreditService.Data.Responses;
using CreditService.Domain.Models;

namespace CreditService.Domain.Abstractions
{
    public interface ICreditService
    {
        Task<CreditTariffResponse> GetAvailableTarrifs(int page, int size);
        Task<Credit> ApplyCredit(ApplyForCreditRequest applyForCreditRequest);
        Task<CreditsResponse> GetMyCredits(int page, int size);
        Task<Credit> GetCreditById(Guid creditId);
        //Task PayCreditById(CreditPaymentRequest creditPaymentRequest, Guid creditId);
        Task<CreditsResponse> GetAllCreditsOfAllUsers(int page, int size);
        Task<CreditTariff> CreateNewTariff(CreateCreditTarrifRequest createCreditTarrifRequest);
        Task AutomaticPayCreditById(Guid creditId, Guid accountId);
        Task<DelinquenciesResponse> GetMyDelinquencies(int page, int size);
        Task<DelinquenciesResponse> GetAllDelinquencies(int page, int size);
        Task<CreditRatingResponse> GetMyCreditRating();
        Task<CreditRatingResponse> GetCreditRatingByUser(Guid userId);
    }
}

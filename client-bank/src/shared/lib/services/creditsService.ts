import { fetchMyCredits, fetchTariffs, applyCredit, type CreditsResponse, type Tariff, type ApplyCreditResponse } from "../api/credits";

export const creditsService = {
  getMyCredits: async (page: number, size: number): Promise<CreditsResponse> => {
    return await fetchMyCredits(page, size);
  },

  getTariffs: async (): Promise<Tariff[]> => {
    return await fetchTariffs();
  },

  applyCredit: async ( tariffId: string, accountId: string, amount: number, term: number): Promise<ApplyCreditResponse> => {
    return await applyCredit(tariffId, accountId, amount, term);
  },
};
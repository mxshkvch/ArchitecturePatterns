import { fetchMyCreditRating, fetchDelinquencies } from "../api/creditAnalytics";

import type { CreditRating, Delinquency } from "../api/creditAnalytics";

export const creditAnalyticsService = {
  getRating: async (): Promise<CreditRating> => {
    return await fetchMyCreditRating();
  },

  getDelinquencies: async (page: number, size: number): Promise<{ delinquencies: Delinquency[]; totalPages: number; }> => {
    const data = await fetchDelinquencies(page, size);

    return {
      delinquencies: data.content,
      totalPages: data.page.totalPages,
    };
  },
};
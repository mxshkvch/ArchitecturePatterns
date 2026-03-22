import { creditAnalyticsService } from "../../../shared/lib/services/creditAnalyticsService";

export const fetchCreditRating = async () => {
  return await creditAnalyticsService.getRating();
};

export const fetchDelinquenciesUseCase = async (page: number, size: number) => {
  return await creditAnalyticsService.getDelinquencies(page, size);
};
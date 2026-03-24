import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { creditService } from '../../../services/api';

export const useCreditsQuery = (page = 0, size = 10) => {
  const apiPage = page + 1;
  
  console.log('🔍 [useCreditsQuery] Query params:', { page: apiPage, size });
  
  return useQuery({
    queryKey: ['credits', apiPage, size],
    queryFn: async () => {
      console.log('🚀 [useCreditsQuery] Fetching credits from API...');
      const result = await creditService.getCredits(apiPage, size);
      console.log('✅ [useCreditsQuery] Fetch result:', result);
      return result;
    },
    staleTime: 30000,
    keepPreviousData: true,
    retry: 1,
  });
};

// Хук для создания кредитного тарифа
export const useCreateCreditTariffMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (tariffData) => creditService.createCreditTariff(tariffData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    },
    onError: (error) => {
      console.error('Error creating credit tariff:', error);
    }
  });
};



// Хук для получения кредита по ID
export const useCreditById = (creditId) => {
  return useQuery({
    queryKey: ['credit', creditId],
    queryFn: () => creditService.getCreditById(creditId),
    enabled: !!creditId,
    staleTime: 30000,
  });
};
export const useUserRating = (userId) => {
  return useQuery({
    queryKey: ['userRating', userId],
    queryFn: async () => {
      console.log('🚀 [useUserRating] Fetching rating for user:', userId);
      const result = await creditService.getUserRating(userId);
      console.log('✅ [useUserRating] Rating result:', result);
      return result;
    },
    enabled: !!userId,
    staleTime: 30000,
    retry: 1,
  });
};
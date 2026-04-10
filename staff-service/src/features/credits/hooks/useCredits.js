import { useState, useEffect } from 'react';
import { useCreditsQuery, useCreateCreditTariffMutation } from '../../../entities/credit/api/creditApi';

export const useCreditsList = (initialSize = 10) => {
  const [page, setPage] = useState(0);
  const [size] = useState(initialSize);
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useCreditsQuery(page, size);
  
  const createTariffMutation = useCreateCreditTariffMutation();
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  
  const handleCreateTariff = async (tariffData) => {
    try {
      await createTariffMutation.mutateAsync(tariffData);
      return { success: true };
    } catch (error) {
      console.error('Failed to create tariff:', error);
      throw error;
    }
  };
  
  const pageInfo = data?.page ? {
    page: data.page.page - 1, 
    size: data.page.size,
    totalElements: data.page.totalElements,
    totalPages: data.page.totalPages,
  } : {
    page: 0,
    size,
    totalElements: 0,
    totalPages: 0,
  };
  
  return {
    credits: data?.content || [],
    loading: isLoading,
    isFetching,
    error,
    pageInfo,
    isCreating: createTariffMutation.isPending,
    handlePageChange,
    handleCreateTariff,
    refetch,
  };
};
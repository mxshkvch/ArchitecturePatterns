// features/transactions/hooks/useTransactions.js
import { useState, useEffect } from 'react';
import { useTransactionsQuery } from '../../../entities/account/api/accountApi';

// Переименовываем экспортируемую функцию
export const useTransactionsList = (accountId, initialSize = 10) => {
  const [page, setPage] = useState(0);
  const [size] = useState(initialSize);
  const [filters, setFilters] = useState({
    fromDate: null,
    toDate: null,
    type: null
  });
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useTransactionsQuery(
    accountId, 
    page, 
    size, 
    filters.fromDate, 
    filters.toDate
  );
  
  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(0);
  };
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  
  const resetFilters = () => {
    setFilters({
      fromDate: null,
      toDate: null,
      type: null
    });
    setPage(0);
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
    transactions: data?.content || [],
    loading: isLoading,
    isFetching,
    error,
    pageInfo,
    filters,
    handleFilterChange,
    handlePageChange,
    resetFilters,
    refetch,
    isEmpty: data?.content?.length === 0,
  };
};

// Добавляем экспорт для обратной совместимости
export const useTransactions = useTransactionsList;
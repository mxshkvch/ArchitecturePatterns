import { useState, useEffect } from 'react';
import { useAccountsQuery } from '../../../entities/account/api/accountApi';

export const useAccounts = (userId, initialSize = 20) => {
  const [page, setPage] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [size] = useState(initialSize);
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useAccountsQuery(userId, page, size, selectedStatus);
  
  useEffect(() => {
    setPage(0);
  }, [selectedStatus]);
  
  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };
  
  const handlePageChange = (newPage) => {
    setPage(newPage);
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
    accounts: data?.content || [],
    loading: isLoading,
    isFetching,
    error,
    pageInfo,
    selectedStatus,
    handleStatusChange,
    handlePageChange,
    refetch,
    isEmpty: data?.content?.length === 0,
  };
};
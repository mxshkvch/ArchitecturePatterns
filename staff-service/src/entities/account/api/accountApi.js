// entities/account/api/accountApi.js
import { useQuery } from '@tanstack/react-query';
import { coreService } from '../../../services/api';

// Хук для получения счетов пользователя
export const useAccountsQuery = (userId, page = 0, size = 20, status = '') => {
  // page уже в 0-индексации, не нужно преобразовывать
  console.log('🔍 [useAccountsQuery] Query params:', { userId, page, size, status });
  
  return useQuery({
    queryKey: ['accounts', userId, page, size, status],
    queryFn: async () => {
      console.log('🚀 [useAccountsQuery] Fetching accounts from API...');
      const result = await coreService.getUserAccounts(userId, page, size, status || undefined);
      console.log('✅ [useAccountsQuery] Fetch result:', {
        contentLength: result?.content?.length,
        totalElements: result?.page?.totalElements
      });
      return result;
    },
    enabled: !!userId,
    staleTime: 30000,
    keepPreviousData: true,
    retry: 1,
  });
};

// Хук для получения транзакций по счету
export const useTransactionsQuery = (accountId, page = 0, size = 10, fromDate = null, toDate = null) => {
  // page уже в 0-индексации
  console.log('🔍 [useTransactionsQuery] Query params:', { accountId, page, size, fromDate, toDate });
  
  return useQuery({
    queryKey: ['transactions', accountId, page, size, fromDate, toDate],
    queryFn: async () => {
      console.log('🚀 [useTransactionsQuery] Fetching transactions from API...');
      const result = await coreService.getAccountTransactions(accountId, page, size, fromDate, toDate);
      console.log('✅ [useTransactionsQuery] Fetch result:', result);
      return result;
    },
    enabled: !!accountId,
    staleTime: 30000,
    keepPreviousData: true,
    retry: 1,
  });
};

// Хук для получения мастер-счета
export const useMasterAccountQuery = () => {
  return useQuery({
    queryKey: ['masterAccount'],
    queryFn: async () => {
      console.log('🚀 [useMasterAccountQuery] Fetching master account...');
      const result = await coreService.getMasterAccount();
      console.log('✅ [useMasterAccountQuery] Fetch result:', result);
      return result;
    },
    staleTime: 30000,
    retry: 1,
  });
};

// Хук для получения счета по ID
export const useAccountById = (accountId) => {
  return useQuery({
    queryKey: ['account', accountId],
    queryFn: () => coreService.getAccountById(accountId),
    enabled: !!accountId,
    staleTime: 30000,
  });
};
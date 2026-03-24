import { useMasterAccountQuery } from '../../../entities/account/api/accountApi';

export const useMasterAccount = () => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useMasterAccountQuery();
  
  const formatBalance = (balance) => {
    const numericBalance = typeof balance === 'string' ? parseFloat(balance) : balance;
    return isNaN(numericBalance) ? 0 : numericBalance;
  };
  
  return {
    account: data,
    loading: isLoading,
    refreshing: isFetching,
    error,
    refresh: refetch,
    formatBalance,
  };
};
import { useEffect, useCallback, useRef } from 'react';
import { signalRService } from '../../services/signalr/signalrService';
import { useQueryClient } from '@tanstack/react-query';

export const useAccountWebSocket = (accountId) => {
  const queryClient = useQueryClient();
  const accountIdRef = useRef(accountId);

  useEffect(() => {
    accountIdRef.current = accountId;
  }, [accountId]);

  const handleOperationInvalidation = useCallback((payload) => {
    if (payload.accountId === accountIdRef.current) {
      console.log('🔄 Invalidating cache for account:', accountIdRef.current);
      queryClient.invalidateQueries({ 
        queryKey: ['transactions', accountIdRef.current] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['accounts'] 
      });
    }
  }, [queryClient]);

  useEffect(() => {
    signalRService.subscribe('operation.invalidation', handleOperationInvalidation);
    
    signalRService.connect();
    
    return () => {
      signalRService.unsubscribe('operation.invalidation', handleOperationInvalidation);
    };
  }, [handleOperationInvalidation]);
};

export const useGlobalWebSocket = () => {
  const queryClient = useQueryClient();

  const handleCreditUpdated = useCallback(() => {
    console.log('🔄 Invalidating credits cache');
    queryClient.invalidateQueries({ queryKey: ['credits'] });
  }, [queryClient]);

  useEffect(() => {
    signalRService.subscribe('credit.updated', handleCreditUpdated);
    signalRService.connect();
    
    return () => {
      signalRService.unsubscribe('credit.updated', handleCreditUpdated);
    };
  }, [handleCreditUpdated]);
};
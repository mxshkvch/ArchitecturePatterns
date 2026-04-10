import React, { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { signalRService } from '../../services/signalr/signalrService';

export const WebSocketProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    console.log('🔌 WebSocketProvider initializing with SignalR...');

    const handleOperationInvalidation = (payload) => {
      console.log('💰 SignalR: Operation invalidation received', payload);
      
      if (payload.accountId) {
        console.log('🔄 Invalidating transactions for account:', payload.accountId);
        queryClient.invalidateQueries({ 
          queryKey: ['transactions', payload.accountId] 
        });
      }
      
      console.log('🔄 Invalidating accounts cache');
      queryClient.invalidateQueries({ 
        queryKey: ['accounts'] 
      });
    };

    const handleAccountUpdated = (payload) => {
      console.log('🏦 SignalR: Account updated', payload);
      queryClient.invalidateQueries({ 
        queryKey: ['accounts'] 
      });
    };

    const handleCreditUpdated = (payload) => {
      console.log('💳 SignalR: Credit updated', payload);
      queryClient.invalidateQueries({ queryKey: ['credits'] });
    };

    signalRService.subscribe('operation.invalidation', handleOperationInvalidation);
    signalRService.subscribe('operation.updated', handleOperationInvalidation);
    signalRService.subscribe('account.updated', handleAccountUpdated);
    signalRService.subscribe('credit.updated', handleCreditUpdated);
    
    signalRService.connect();

    return () => {
      signalRService.unsubscribe('operation.invalidation', handleOperationInvalidation);
      signalRService.unsubscribe('operation.updated', handleOperationInvalidation);
      signalRService.unsubscribe('account.updated', handleAccountUpdated);
      signalRService.unsubscribe('credit.updated', handleCreditUpdated);
    };
  }, [queryClient]);

  return <>{children}</>;
};
import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketClient, WebSocketEvent } from '../core/websocket/websocket-client';
import { DIContainer } from '../core/di/container';
import { config } from '../config/env';

export interface UseWebSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  wsUrl?: string;
}

export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const { 
    autoConnect = true, 
    onConnect, 
    onDisconnect, 
    onError,
    wsUrl = config.wsUrl
  } = options;
  
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const wsClient = useRef<WebSocketClient | null>(null);
  
  useEffect(() => {
    // Check if WebSocketClient is registered in DI
    if (DIContainer.getInstance().has('WebSocketClient')) {
      wsClient.current = DIContainer.getInstance().resolve<WebSocketClient>('WebSocketClient');
    } else {
      // Create a new instance if not in DI
      wsClient.current = new WebSocketClient({ url: wsUrl });
    }
    
    const client = wsClient.current;
    
    const handleConnect = () => {
      setIsConnected(true);
      setIsReconnecting(false);
      onConnect?.();
    };
    
    const handleDisconnect = () => {
      setIsConnected(false);
      onDisconnect?.();
    };
    
    const handleReconnecting = () => {
      setIsReconnecting(true);
    };
    
    const handleError = (error: Error) => {
      console.error('WebSocket error:', error);
      onError?.(error);
    };
    
    client.on(WebSocketEvent.CONNECT, handleConnect);
    client.on(WebSocketEvent.DISCONNECT, handleDisconnect);
    client.on(WebSocketEvent.RECONNECTING, handleReconnecting);
    client.on(WebSocketEvent.ERROR, handleError);
    
    if (autoConnect) {
      client.connect();
    }
    
    return () => {
      client.off(WebSocketEvent.CONNECT, handleConnect);
      client.off(WebSocketEvent.DISCONNECT, handleDisconnect);
      client.off(WebSocketEvent.RECONNECTING, handleReconnecting);
      client.off(WebSocketEvent.ERROR, handleError);
      
      if (autoConnect) {
        client.disconnect();
      }
    };
  }, [autoConnect, onConnect, onDisconnect, onError, wsUrl]);
  
  const subscribe = useCallback((channel: string, callback: (data: any) => void) => {
    wsClient.current?.subscribe(channel, callback);
  }, []);
  
  const unsubscribe = useCallback((channel: string, callback: (data: any) => void) => {
    wsClient.current?.unsubscribe(channel, callback);
  }, []);
  
  const send = useCallback((message: any) => {
    wsClient.current?.send(message);
  }, []);
  
  return {
    isConnected,
    isReconnecting,
    subscribe,
    unsubscribe,
    send,
  };
};
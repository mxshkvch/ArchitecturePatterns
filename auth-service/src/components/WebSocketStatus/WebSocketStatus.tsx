// src/components/WebSocketStatus/WebSocketStatus.tsx
import * as React from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';

export const WebSocketStatus: React.FC = () => {
  const { isConnected, isReconnecting } = useWebSocket({
    autoConnect: true,
  });
  
  let statusText = 'Live';
  let statusClass = 'status-connected';
  
  if (isReconnecting) {
    statusText = 'Reconnecting...';
    statusClass = 'status-reconnecting';
  } else if (!isConnected) {
    statusText = 'Offline';
    statusClass = 'status-disconnected';
  }
  
  return (
    <div className={`websocket-status ${statusClass}`}>
      <span className="status-dot" />
      <span className="status-text">{statusText}</span>
    </div>
  );
};
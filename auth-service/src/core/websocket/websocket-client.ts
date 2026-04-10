// src/core/websocket/websocket-client.ts
import { EventEmitter } from '../events/events-emitter';

// Заменяем enum на константы
export const WebSocketEvent = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
  MESSAGE: 'message',
} as const;

export type WebSocketEventType = typeof WebSocketEvent[keyof typeof WebSocketEvent];

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  id?: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

export class WebSocketClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimeout: ReturnType<typeof setInterval> | null = null;
  private isConnecting = false;
  private messageQueue: WebSocketMessage[] = [];
  private config: Required<WebSocketConfig>;

  constructor(config: WebSocketConfig) {
    super();
    this.config = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000,
      ...config,
    };
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;
    this.emit(WebSocketEvent.RECONNECTING, { attempt: this.reconnectAttempts });

    try {
      this.ws = new WebSocket(this.config.url);
      this.setupEventHandlers();
    } catch (error) {
      this.handleError(error as Error);
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.isConnecting = false;
      this.reconnectAttempts = 0;
      this.emit(WebSocketEvent.CONNECT);
      this.startHeartbeat();
      this.flushMessageQueue();
    };

    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data);
        this.emit(WebSocketEvent.MESSAGE, message);
        this.emit(`message:${message.type}`, message.payload);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.onerror = (event: Event) => {
      console.error('WebSocket error:', event);
      this.emit(WebSocketEvent.ERROR, event);
    };

    this.ws.onclose = (event: CloseEvent) => {
      console.log(`WebSocket closed: ${event.code} - ${event.reason}`);
      this.isConnecting = false;
      this.stopHeartbeat();
      this.emit(WebSocketEvent.DISCONNECT, event);
      this.scheduleReconnect();
    };
  }

  private startHeartbeat(): void {
    this.heartbeatTimeout = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.send({
          type: 'ping',
          payload: {},
          timestamp: new Date().toISOString(),
        });
      }
    }, this.config.heartbeatInterval);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatTimeout) {
      clearInterval(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.emit(WebSocketEvent.ERROR, new Error('Max reconnection attempts reached'));
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, this.config.reconnectInterval);
  }

  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        this.send(message);
      }
    }
  }

  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.messageQueue.push(message);
    }
  }

  subscribe(channel: string, callback: (data: any) => void): void {
    this.on(`message:${channel}`, callback);
    
    this.send({
      type: 'subscribe',
      payload: { channel },
      timestamp: new Date().toISOString(),
    });
  }

  unsubscribe(channel: string, callback: (data: any) => void): void {
    this.off(`message:${channel}`, callback);
    
    this.send({
      type: 'unsubscribe',
      payload: { channel },
      timestamp: new Date().toISOString(),
    });
  }

  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private handleError(error: Error): void {
    this.emit(WebSocketEvent.ERROR, error);
  }
}
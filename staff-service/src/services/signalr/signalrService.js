import * as signalR from '@microsoft/signalr';

class SignalRService {
  constructor() {
    this.connection = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.listeners = new Map();
  }

  async connect() {
    if (this.isConnected) {
      console.log('SignalR already connected');
      return;
    }

    const token = localStorage.getItem('access_token');
    const userId = localStorage.getItem('user_id');
    const userRole = localStorage.getItem('user_role');
    
    const hubUrl = `${import.meta.env.VITE_CORE_SERVICE_URL || 'http://89.23.105.66:5000'}/hubs/operations`;
    
    console.log('🔌 Connecting to SignalR hub:', hubUrl);
    console.log('👤 User ID:', userId);
    console.log('👔 User Role:', userRole);
    
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(signalR.LogLevel.Information)
      .build();
    
    this.connection.onclose((error) => {
      console.log('🔌 SignalR connection closed:', error);
      this.isConnected = false;
    });
    
    this.connection.onreconnecting((error) => {
      console.log('🔄 SignalR reconnecting:', error);
    });
    
    this.connection.onreconnected((connectionId) => {
      console.log('✅ SignalR reconnected:', connectionId);
      this.isConnected = true;
      this.reconnectAttempts = 0;
    });
    
    try {
      await this.connection.start();
      console.log('✅ SignalR connected successfully!');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      this.registerServerEvents();
      
    } catch (error) {
      console.error('❌ SignalR connection failed:', error);
      this.isConnected = false;
      
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        const delay = 3000 * Math.pow(1.5, this.reconnectAttempts);
        console.log(`🔄 Retrying connection in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        setTimeout(() => this.connect(), delay);
      }
    }
  }
  
  registerServerEvents() {
    this.connection.on('operationUpdated', (payload) => {
      console.log('📨 SignalR operationUpdated received:', payload);
      this.handleOperationUpdated(payload);
    });
    
    this.connection.on('accountUpdated', (payload) => {
      console.log('📨 SignalR accountUpdated received:', payload);
      this.handleAccountUpdated(payload);
    });
    
    this.connection.on('creditUpdated', (payload) => {
      console.log('📨 SignalR creditUpdated received:', payload);
      this.handleCreditUpdated(payload);
    });
  }
  
  handleOperationUpdated(payload) {
    console.log('💰 Operation updated:', {
      type: payload.type,
      operationId: payload.operationId,
      accountId: payload.accountId,
      userId: payload.userId,
      occurredAt: payload.occurredAt
    });
    
    if (payload.type === 'operation_invalidation') {
      this.notifyListeners('operation.invalidation', payload);
    }
    
    this.notifyListeners('operation.updated', payload);
  }
  
  handleAccountUpdated(payload) {
    console.log('🏦 Account updated:', payload);
    this.notifyListeners('account.updated', payload);
  }
  
  handleCreditUpdated(payload) {
    console.log('💳 Credit updated:', payload);
    this.notifyListeners('credit.updated', payload);
  }
  
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    console.log(`📡 Subscribed to ${event}, total: ${this.listeners.get(event).size}`);
    
    if (!this.isConnected) {
      this.connect();
    }
  }
  
  unsubscribe(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
      console.log(`📡 Unsubscribed from ${event}, remaining: ${this.listeners.get(event).size}`);
    }
  }
  
  notifyListeners(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }
  
  disconnect() {
    if (this.connection) {
      this.connection.stop();
      this.isConnected = false;
    }
    this.listeners.clear();
  }
}

export const signalRService = new SignalRService();
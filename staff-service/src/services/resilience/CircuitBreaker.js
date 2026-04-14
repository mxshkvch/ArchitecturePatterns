export class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 0.7;
    this.rollingCount = options.rollingCount || 10;
    this.halfOpenAfter = options.halfOpenAfter || 30000;
    this.name = options.name || 'default';
    
    this.state = 'CLOSED';
    this.results = []; 
    this.nextAttempt = null;
    this.listeners = {
      onOpen: [],
      onClose: [],
      onHalfOpen: []
    };
  }
  
  getFailureRate() {
    if (this.results.length === 0) return 0;
    const failures = this.results.filter(r => !r.success).length;
    return failures / this.results.length;
  }
  
  recordResult(success) {
    if (this.state === 'OPEN') return;
    
    this.results.push({ success, timestamp: Date.now() });
    
    while (this.results.length > this.rollingCount) {
      this.results.shift();
    }
    
    const failureRate = this.getFailureRate();
    
    if (this.state === 'CLOSED' && failureRate >= this.failureThreshold) {
      this.open();
    } else if (this.state === 'HALF_OPEN') {
      if (success) {
        this.close();
      } else {
        this.open();
      }
    }
  }
  
  open() {
    this.state = 'OPEN';
    this.nextAttempt = Date.now() + this.halfOpenAfter;
    
    console.error(`🔌 [CircuitBreaker:${this.name}] OPENED - Failure rate: ${(this.getFailureRate() * 100).toFixed(1)}%`);
    
    this.listeners.onOpen.forEach(cb => cb(this.name, this.getState()));
    
    setTimeout(() => {
      if (this.state === 'OPEN') {
        this.halfOpen();
      }
    }, this.halfOpenAfter);
  }
  
  halfOpen() {
    this.state = 'HALF_OPEN';
    console.log(`🔄 [CircuitBreaker:${this.name}] HALF_OPEN - Testing recovery`);
    this.listeners.onHalfOpen.forEach(cb => cb(this.name, this.getState()));
  }
  
  close() {
    this.state = 'CLOSED';
    this.results = [];
    console.log(`✅ [CircuitBreaker:${this.name}] CLOSED - Service recovered`);
    this.listeners.onClose.forEach(cb => cb(this.name, this.getState()));
  }
  
  async execute(fn) {
    if (this.state === 'OPEN') {
      const waitSeconds = Math.ceil((this.nextAttempt - Date.now()) / 1000);
      const error = new Error(`⛔ Service ${this.name} is temporarily unavailable (Circuit open, retry in ${waitSeconds}s)`);
      error.code = 'CIRCUIT_OPEN';
      error.serviceName = this.name;
      throw error;
    }
    
    try {
      const result = await fn();
      this.recordResult(true);
      return result;
    } catch (error) {
      if (error.response?.status !== 401) {
        this.recordResult(false);
      }
      throw error;
    }
  }
  
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }
  
  getState() {
    return {
      state: this.state,
      failureRate: this.getFailureRate(),
      nextAttempt: this.nextAttempt,
      totalRequests: this.results.length
    };
  }
}
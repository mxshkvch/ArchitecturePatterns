class ResilienceMonitor {
  constructor() {
    this.services = new Map();
    this.listeners = [];
  }
  
  registerService(name, client) {
    this.services.set(name, client);
    

    console.log(`📊 Registered service: ${name}`);
  }
  
  getAllStatuses() {
    const statuses = {};
    for (const [name, client] of this.services) {
      statuses[name] = client.getCircuitBreakerStatus();
    }
    return statuses;
  }
  
  subscribe(callback) {
    this.listeners.push(callback);
  }
  
  notify() {
    const statuses = this.getAllStatuses();
    this.listeners.forEach(cb => cb(statuses));
  }
}

export const resilienceMonitor = new ResilienceMonitor();


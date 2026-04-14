import { CircuitBreaker } from './CircuitBreaker';
import { RetryHandler } from './RetryHandler';

export class ResilientAxiosWrapper {
  constructor(axiosInstance, serviceName, options = {}) {
    this.axios = axiosInstance;
    this.serviceName = serviceName;
    
    this.circuitBreakers = new Map();
    
    this.retryHandler = new RetryHandler(options.retry);
    this.circuitBreakerOptions = options.circuitBreaker || {};
    
    this.get = this.request.bind(this, 'GET');
    this.post = this.request.bind(this, 'POST');
    this.put = this.request.bind(this, 'PUT');
    this.delete = this.request.bind(this, 'DELETE');
    this.patch = this.request.bind(this, 'PATCH');
  }
  
  getKey(method, url) {
    const baseUrl = url.split('?')[0];
    return `${method}:${baseUrl}`;
  }
  
  getCircuitBreaker(method, url) {
    const key = this.getKey(method, url);
    
    if (!this.circuitBreakers.has(key)) {
      this.circuitBreakers.set(key, new CircuitBreaker({
        name: `${this.serviceName}${key}`,
        ...this.circuitBreakerOptions
      }));
    }
    
    return this.circuitBreakers.get(key);
  }
  
  async request(method, url, data = null, config = {}) {
    const breaker = this.getCircuitBreaker(method, url);
    
    return breaker.execute(async () => {
      return this.retryHandler.execute(async () => {
        let response;
        
        switch (method) {
          case 'GET':
            response = await this.axios.get(url, config);
            break;
          case 'POST':
            response = await this.axios.post(url, data, config);
            break;
          case 'PUT':
            response = await this.axios.put(url, data, config);
            break;
          case 'DELETE':
            response = await this.axios.delete(url, config);
            break;
          case 'PATCH':
            response = await this.axios.patch(url, data, config);
            break;
        }
        
        return response;
      });
    });
  }
  
  getCircuitBreakerStatus() {
    const status = {};
    for (const [key, breaker] of this.circuitBreakers) {
      status[key] = breaker.getState();
    }
    return status;
  }
  
  resetCircuitBreaker(method, url) {
    const key = this.getKey(method, url);
    const breaker = this.circuitBreakers.get(key);
    if (breaker && breaker.state === 'OPEN') {
      breaker.close();
    }
  }
}
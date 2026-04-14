import axios from 'axios';
import { CircuitBreaker, RetryPolicy, composePolicies } from 'cockatiel';

// Retry policy: 3 попытки с экспоненциальной задержкой
const retryPolicy = RetryPolicy.exponentialBackoff({
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 5000,
  backoffMultiplier: 2
});

const breaker = new CircuitBreaker({
  halfOpenAfter: 30000,  
  rollingCount: 10,       
    failureThreshold: 0.7,  
  throwOnBrokenRejection: true
});

const composedPolicy = composePolicies(retryPolicy, breaker);

export const apiClient = {
  request: composedPolicy.wrap(async (config) => {
    const response = await axios(config);
    return response.data;
  }),
  
  get: (url, config) => apiClient.request({ ...config, method: 'GET', url }),
  post: (url, data, config) => apiClient.request({ ...config, method: 'POST', url, data }),
};

breaker.onBreak(() => console.warn('🔌 Circuit breaker OPENED!'));
breaker.onHalfOpen(() => console.log('🔄 Circuit breaker HALF-OPEN (testing)'));
breaker.onClose(() => console.log('✅ Circuit breaker CLOSED (normal)'));
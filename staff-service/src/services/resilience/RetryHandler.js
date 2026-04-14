export class RetryHandler {
  constructor(options = {}) {
    this.maxAttempts = options.maxAttempts || 3;
    this.initialDelay = options.initialDelay || 1000;
    this.maxDelay = options.maxDelay || 5000;
    this.backoffMultiplier = options.backoffMultiplier || 2;
    this.shouldRetry = options.shouldRetry || ((error) => {
      const status = error.response?.status;
      return !status || (status >= 500 || status === 408 || status === 429);
    });
  }
  
  async execute(fn, attempt = 1) {
    try {
      return await fn();
    } catch (error) {
      if (error.code === 'CIRCUIT_OPEN') {
        throw error;
      }
      
      if (!this.shouldRetry(error) || attempt >= this.maxAttempts) {
        throw error;
      }
      
      const delay = Math.min(
        this.initialDelay * Math.pow(this.backoffMultiplier, attempt - 1),
        this.maxDelay
      );
      
      console.log(`🔄 Retry ${attempt}/${this.maxAttempts} for ${error.config?.url} after ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.execute(fn, attempt + 1);
    }
  }
}
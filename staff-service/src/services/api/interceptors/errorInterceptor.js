import { tokenManager } from '../auth/tokenManager';

export const createErrorInterceptor = (onUnauthorized) => {
  return (error) => {
    if (error.response) {
      const { status, data, config } = error.response;
      
      console.error(`❌ API Error [${status}]: ${config.method?.toUpperCase()} ${config.url}`);
      console.error('Error details:', data);
      
      if (status === 401) {
        console.log('🔴 Unauthorized (401) - redirecting to login');
        if (onUnauthorized) {
          onUnauthorized();
        } else {
          tokenManager.clear();
          window.location.href = 'http://localhost:5175/login';
        }
      }
      
      if (status === 403) {
        console.error('🔴 Forbidden (403) - insufficient permissions');
      }
      
      if (status === 404) {
        console.error('🔴 Not Found (404) - resource not available');
      }
      
      if (status >= 500) {
        console.error('🔴 Server Error (500+) - internal server error');
      }
    } else if (error.request) {
      console.error('❌ Network Error: No response received');
    } else {
      console.error('❌ Request Error:', error.message);
    }
    
    return Promise.reject(error);
  };
};
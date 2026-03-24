import axios from 'axios';
import { ENDPOINTS } from './endpoints';

export const createApiClient = (baseURL, withAuth = true) => {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  client.interceptors.request.use((config) => {
    config.metadata = { startTime: Date.now() };
    
    if (withAuth) {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`🔐 [REQUEST] ${config.method?.toUpperCase()} ${config.url}`, {
          hasToken: true,
          tokenPreview: token.substring(0, 30) + '...',
          params: config.params
        });
      } else {
        console.warn(`⚠️ [REQUEST] ${config.method?.toUpperCase()} ${config.url} - NO TOKEN`);
      }
    } else {
      console.log(`📡 [REQUEST] ${config.method?.toUpperCase()} ${config.url} (no auth)`);
    }
    
    return config;
  });
  
  client.interceptors.response.use(
    (response) => {
      const duration = Date.now() - response.config.metadata.startTime;
      console.log(`✅ [RESPONSE] ${response.config.method?.toUpperCase()} ${response.config.url} - Status: ${response.status} (${duration}ms)`, {
        dataLength: response.data?.content?.length || Object.keys(response.data || {}).length
      });
      return response;
    },
    (error) => {
      const duration = error.config?.metadata ? Date.now() - error.config.metadata.startTime : 0;
      console.error(`❌ [ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response?.status} (${duration}ms)`, {
        message: error.message,
        data: error.response?.data
      });
      
      if (error.response?.status === 401) {
        console.log('🔴 Unauthorized! Clearing token and redirecting to login...');
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      return Promise.reject(error);
    }
  );
  
  return client;
};

export const userApiClient = createApiClient(ENDPOINTS.USER_SERVICE, true);
export const creditApiClient = createApiClient(ENDPOINTS.CREDIT_SERVICE, true);
export const coreApiClient = createApiClient(ENDPOINTS.CORE_SERVICE, true);
export const settingsApiClient = createApiClient(ENDPOINTS.SETTINGS_SERVICE, true);
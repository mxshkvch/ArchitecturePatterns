// services/api/config/axiosConfig.js
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
    if (withAuth) {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`🔐 [API] ${config.method?.toUpperCase()} ${config.url} - Token added`);
      } else {
        console.warn(`⚠️ [API] ${config.method?.toUpperCase()} ${config.url} - No token`);
      }
    }
    return config;
  });
  
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        console.log('🔴 Unauthorized, clearing token...');
        localStorage.clear();
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
  );
  
  return client;
};

// Создаем клиенты для разных сервисов
export const userApiClient = createApiClient(ENDPOINTS.USER_SERVICE, true);
export const creditApiClient = createApiClient(ENDPOINTS.CREDIT_SERVICE, true);
export const coreApiClient = createApiClient(ENDPOINTS.CORE_SERVICE, true);
export const settingsApiClient = createApiClient(ENDPOINTS.SETTINGS_SERVICE, true);
export const authApiClient = createApiClient(ENDPOINTS.AUTH_SERVICE, true); // Добавляем клиент для AuthService
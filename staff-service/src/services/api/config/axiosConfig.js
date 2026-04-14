import axios from 'axios';
import { ENDPOINTS } from './endpoints';
import { ResilientAxiosWrapper } from '../../resilience/ResilienceAxiosWrapper';

const createRawApiClient = (baseURL, withAuth = true) => {
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

// Конфигурации для разных сервисов (можно настроить индивидуально)
const resilienceConfigs = {
  [ENDPOINTS.USER_SERVICE]: {
    retry: { maxAttempts: 3, initialDelay: 1000 },
    circuitBreaker: { failureThreshold: 0.7, halfOpenAfter: 30000 }
  },
  [ENDPOINTS.CREDIT_SERVICE]: {
    retry: { maxAttempts: 3, initialDelay: 1000 },
    circuitBreaker: { failureThreshold: 0.7, halfOpenAfter: 30000 }
  },
  [ENDPOINTS.CORE_SERVICE]: {
    retry: { maxAttempts: 2, initialDelay: 500 },  // менее критичный
    circuitBreaker: { failureThreshold: 0.8, halfOpenAfter: 60000 }
  },
  [ENDPOINTS.SETTINGS_SERVICE]: {
    retry: { maxAttempts: 3, initialDelay: 1000 },
    circuitBreaker: { failureThreshold: 0.7, halfOpenAfter: 30000 }
  },
  [ENDPOINTS.AUTH_SERVICE]: {
    retry: { maxAttempts: 1, initialDelay: 500 },  // для auth меньше попыток
    circuitBreaker: { failureThreshold: 0.5, halfOpenAfter: 60000 } // более строгий порог
  }
};

const rawUserApiClient = createRawApiClient(ENDPOINTS.USER_SERVICE, true);
const rawCreditApiClient = createRawApiClient(ENDPOINTS.CREDIT_SERVICE, true);
const rawCoreApiClient = createRawApiClient(ENDPOINTS.CORE_SERVICE, true);
const rawSettingsApiClient = createRawApiClient(ENDPOINTS.SETTINGS_SERVICE, true);
const rawAuthApiClient = createRawApiClient(ENDPOINTS.AUTH_SERVICE, true);

export const userApiClient = new ResilientAxiosWrapper(
  rawUserApiClient, 
  'UserService', 
  resilienceConfigs[ENDPOINTS.USER_SERVICE]
);

export const creditApiClient = new ResilientAxiosWrapper(
  rawCreditApiClient, 
  'CreditService', 
  resilienceConfigs[ENDPOINTS.CREDIT_SERVICE]
);

export const coreApiClient = new ResilientAxiosWrapper(
  rawCoreApiClient, 
  'CoreService', 
  resilienceConfigs[ENDPOINTS.CORE_SERVICE]
);

export const settingsApiClient = new ResilientAxiosWrapper(
  rawSettingsApiClient, 
  'SettingsService', 
  resilienceConfigs[ENDPOINTS.SETTINGS_SERVICE]
);

export const authApiClient = new ResilientAxiosWrapper(
  rawAuthApiClient, 
  'AuthService', 
  resilienceConfigs[ENDPOINTS.AUTH_SERVICE]
);

export const rawClients = {
  user: rawUserApiClient,
  credit: rawCreditApiClient,
  core: rawCoreApiClient,
  settings: rawSettingsApiClient,
  auth: rawAuthApiClient
};
import { tokenManager } from '../auth/tokenManager';

export const authInterceptor = (config) => {
  const token = tokenManager.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`🔐 Adding token to request: ${config.method?.toUpperCase()} ${config.url}`);
  } else {
    console.warn(`⚠️ No token for request: ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
};
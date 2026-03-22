// services/api.js
import axios from 'axios';

const USER_SERVICE_URL = 'http://89.23.105.66:60882'; 
const CORE_SERVICE_URL = 'http://89.23.105.66:5000'; 
const CREDIT_SERVICE_URL = 'http://89.23.105.66:5107'; 
const SETTINGS_URL = 'http://89.23.105.66:5208/api';

// Функция для декодирования JWT токена
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error decoding JWT:', e);
    return null;
  }
};

// Получение токена из URL или localStorage
export const getTokenFromUrl = () => {
  console.log('\n🔍 ===== getTokenFromUrl START =====');
  console.log('Current URL:', window.location.href);
  console.log('Current search:', window.location.search);
  console.log('Current pathname:', window.location.pathname);
  
  const params = new URLSearchParams(window.location.search);
  let token = params.get('token');
  let role = params.get('role');
  
  console.log('🔍 getTokenFromUrl - token present:', !!token);
  console.log('🔍 getTokenFromUrl - role:', role);
  
  if (!token) {
    console.log('Token not in URL, checking sessionStorage...');
    token = sessionStorage.getItem('url_token');
    role = sessionStorage.getItem('url_role');
    if (token) {
      console.log('Found token in sessionStorage');
      // Очищаем sessionStorage после использования
      sessionStorage.removeItem('url_token');
      sessionStorage.removeItem('url_role');
    }
  }

  if (token && role === 'staff') {
    console.log('✅ Found token and role in URL');
    
    // Сохраняем токен в localStorage
    localStorage.setItem('access_token', token);
    localStorage.setItem('user_role', role);
    
    // Декодируем JWT токен для получения информации
    const decoded = decodeJWT(token);
    if (decoded) {
      console.log('📦 Decoded JWT payload:', decoded);
      if (decoded.email) {
        localStorage.setItem('user_email', decoded.email);
      }
      if (decoded.nameid) {
        localStorage.setItem('user_id', decoded.nameid);
      }
      if (decoded.role) {
        localStorage.setItem('user_role_from_token', decoded.role);
      }
    } else {
      // Если не JWT, пробуем как есть
      console.log('⚠️ Token is not JWT format, storing as is');
    }
    
    // Очищаем URL от токена
    window.history.replaceState({}, document.title, window.location.pathname);
    console.log('🧹 URL cleaned');
    
    return token;
  }
  
  const storedToken = localStorage.getItem('access_token');
  console.log('📀 Using stored token from localStorage:', !!storedToken);
  return storedToken;
};

// Получение токена для авторизации (добавляем эту функцию)
export const getAuthToken = () => {
  return localStorage.getItem('access_token') || localStorage.getItem('token');
};

// Проверка аутентификации
export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  const role = localStorage.getItem('user_role');
  
  console.log('🔐 isAuthenticated check - token:', !!token, 'role:', role);
  
  if (!token || !role || role !== 'staff') {
    console.log('❌ Not authenticated: missing token or role');
    return false;
  }
  
  // Проверяем срок действия токена (если это JWT)
  try {
    const decoded = decodeJWT(token);
    if (decoded && decoded.exp) {
      const expTime = decoded.exp * 1000; // Конвертируем в миллисекунды
      const now = Date.now();
      console.log('⏰ Token expires at:', new Date(expTime).toLocaleString());
      console.log('⏰ Current time:', new Date(now).toLocaleString());
      
      if (expTime < now) {
        console.log('❌ Token expired');
        logout();
        return false;
      }
      console.log('✅ Token is valid');
    } else {
      console.log('⚠️ Cannot decode token or no exp claim, assuming valid');
    }
  } catch (error) {
    console.error('Error checking token expiration:', error);
  }
  
  return true;
};

// Выход из системы
export const logout = () => {
  console.log('🚪 Logging out...');
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_role_from_token');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'http://localhost:5175/login'; // Auth service login URL
};

// Получение токена для запросов
export const getToken = () => {
  const token = localStorage.getItem('access_token') || localStorage.getItem('token');
  console.log('🔑 getToken called - token present:', !!token);
  if (token) {
    console.log('🔑 Token (first 50 chars):', token.substring(0, 50) + '...');
  }
  return token;
};

// Инициализация приложения - проверяем токен из URL при загрузке
export const initializeAuth = () => {
  console.log('🚀 Initializing auth...');
  const token = getTokenFromUrl();
  
  if (token) {
    console.log('✅ Authentication token received from auth service');
    console.log('📊 Current localStorage:');
    console.log('  - access_token:', localStorage.getItem('access_token') ? '✅ Present' : '❌ Missing');
    console.log('  - user_role:', localStorage.getItem('user_role'));
    console.log('  - user_email:', localStorage.getItem('user_email'));
    return true;
  }
  
  console.log('❌ No token found in URL');
  return false;
};

// Создаем экземпляры axios с интерцепторами
const CreditApi = axios.create({
  baseURL: CREDIT_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const UserApi = axios.create({
  baseURL: USER_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

const CoreApi = axios.create({
  baseURL: CORE_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Интерцептор для добавления токена во все запросы
const authInterceptor = (config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log(`🔐 Adding token to request: ${config.method?.toUpperCase()} ${config.url}`);
  } else {
    console.warn(`⚠️ No token for request: ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
};

// Интерцептор для обработки ошибок авторизации
const errorInterceptor = (error) => {
  if (error.response && error.response.status === 401) {
    console.log('🔴 Unauthorized (401) - redirecting to login');
    logout();
  }
  return Promise.reject(error);
};

// Добавляем интерцепторы
CoreApi.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));
CreditApi.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));
UserApi.interceptors.request.use(authInterceptor, (error) => Promise.reject(error));

// Добавляем интерцепторы для ответов
CoreApi.interceptors.response.use(
  (response) => response,
  errorInterceptor
);
CreditApi.interceptors.response.use(
  (response) => response,
  errorInterceptor
);
UserApi.interceptors.response.use(
  (response) => response,
  errorInterceptor
);

// API функции
export const login = async (email, password) => {
  try {
    console.log('📝 Login attempt:', email);
    const response = await UserApi.post('/api/auth/login', { email, password });
    console.log('✅ Login response:', response.data);
    
    // Сохраняем токен от сервиса пользователей
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error during login:', error);
    throw error;
  }
};

export const getUsers = async (Page = 1, Size = 5, role = null) => {
  try {
    const params = { Page, Size };
    if (role) {
      params.role = role;
    }
    
    console.log('📡 API request users:', { params });
    const response = await UserApi.get('/admin/users', { params });
    console.log('📥 API response users:', response.data);

    return response.data;
  } catch (error) {
    console.error('❌ Error loading users:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await UserApi.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating user:', error);
    throw error;
  }
};

export const updateUserStatus = async (userId, status) => {
  try {
    const response = await UserApi.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('❌ Error updating user status:', error);
    throw error;
  }
};

export const getCredits = async (Page = 1, Size = 5) => {
  try {
    const params = { Page, Size };
    const response = await CreditApi.get('/admin/credits', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Error loading credits:', error);
    throw error;
  }
};

export const createCreditTariff = async (tariffData) => {
  try {
    const response = await CreditApi.post('/admin/credit-tariffs', tariffData);
    return response.data;
  } catch (error) {
    console.error('❌ Error creating credit tariff:', error);
    throw error;
  }
};

export const getUserAccounts = async (userId, page = 1, size = 5, status = null) => {
  try {
    const params = { page, size };
    if (status) {
      params.status = status;
    }
    
    const response = await CoreApi.get('api/admin/accounts', { 
      params: {
        ...params,
        userId
      }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Error loading user accounts:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await UserApi.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Error loading user:', error);
    throw error;
  }
};

export const getAccountTransactions = async (accountId, Page = 1, Size = 5, fromDate = null, toDate = null) => {
  try {
    const params = { Page, Size };
    if (fromDate) {
      params.fromDate = fromDate;
    }
    if (toDate) {
      params.toDate = toDate;
    }
    
    const response = await CoreApi.get(`/api/accounts/${accountId}/transactions`, { params });
    return response.data;
  } catch (error) {
    console.error('❌ Error loading transactions:', error);
    throw error;
  }
};

export const getUserRating = async (userId) => {
  try {
    console.log('📊 Fetching rating for user:', userId);
    console.log('📊 Full URL:', `${CREDIT_SERVICE_URL}/admin/credits/rating/${userId}`);
    
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    const response = await CreditApi.get(`/admin/credits/rating/${userId}`);
    console.log('✅ Rating response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching user rating:', error);
    console.error('❌ Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url
    });
    throw error;
  }
};

export const getMasterAccount = async () => {
  try {
    console.log('🏦 Fetching master account...');
    const response = await CoreApi.get('/api/accounts/99999999-9999-9999-9999-999999999999');
    console.log('✅ Master account response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching master account:', error);
    throw error;
  }
};

const apiClient = axios.create({
  baseURL: SETTINGS_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken(); // Используем getAuthToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log('🔐 Adding token to settings request');
  } else {
    console.warn('⚠️ No token for settings request');
  }
  return config;
});

export const getSettings = async (applicationType = 'EMPLOYEE') => {
  try {
    console.log(`📡 Fetching settings for ${applicationType}...`);
    const response = await apiClient.get('/bff/settings', {
      params: { applicationType }
    });
    console.log('✅ Settings loaded:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching settings:', error);
    throw error;
  }
};

export const updateSettings = async (settings) => {
  try {
    console.log('📤 Updating settings:', settings);
    const response = await apiClient.put('/bff/settings', settings);
    console.log('✅ Settings updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating settings:', error);
    throw error;
  }
};

export { CoreApi, CreditApi, UserApi };
import axios from 'axios';

const USER_SERVICE_URL = 'http://localhost:60882'; 
const CORE_SERVICE_URL = 'http://localhost:5000'; 
const CREDIT_SERVICE_URL = 'http://localhost:5107'; 

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

CoreApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

CreditApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

UserApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const login = async (email, password) => {
  try {
    console.log(email, password)
    const response = await UserApi.post('/api/auth/login', { email, password });
    console.log(response.data)
    return response.data;
  } catch (error) {
    console.error('Ошибка при входе в систему:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getUsers = async (Page = 1, Size = 5, role = null) => {
  try {
    const params = { Page, Size };
    if (role) {
      params.role = role;
    }
    
    console.log('API запрос пользователей:', { params });
    const response = await UserApi.get('/admin/users', { params });
    console.log('API ответ пользователей:', response.data);

    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке пользователей:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await UserApi.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
    throw error;
  }
};

export const updateUserStatus = async (userId, status) => {
  try {
    const response = await UserApi.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении статуса пользователя:', error);
    throw error;
  }
};

export const getCredits = async (Page = 1, Size = 5) => {
  try {
    const params = { Page, Size };
    const response = await CreditApi.get('/admin/credits', { params });
    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке кредитов:', error);
    throw error;
  }
};

export const createCreditTariff = async (tariffData) => {
  try {
    const response = await CreditApi.post('/admin/credit-tariffs', tariffData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании кредитного тарифа:', error);
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
    console.error('Ошибка при загрузке счетов пользователя:', error);
    throw error;
  }
};

export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке пользователя:', error);
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
    console.error('Ошибка при загрузке транзакций:', error);
    throw error;
  }
};
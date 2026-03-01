import axios from 'axios';

const USER_SERVICE_URL = 'https://localhost:60882/api'; 

const api = axios.create({
  baseURL: USER_SERVICE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
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
    const response = await api.post('/auth/login', { email, password });
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

export const getUsers = async (page = 0, size = 20, role = null) => {
  try {
    const params = { page, size };
    if (role) {
      params.role = role;
    }
    
    const response = await api.get('/admin/users', { params });
    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке пользователей:', error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
    throw error;
  }
};

export const updateUserStatus = async (userId, status) => {
  try {
    const response = await api.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Ошибка при обновлении статуса пользователя:', error);
    throw error;
  }
};

export const getCredits = async (page = 0, size = 20) => {
  try {
    const params = { page, size };
    const response = await api.get('/admin/credits', { params });
    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке кредитов:', error);
    throw error;
  }
};

export const createCreditTariff = async (tariffData) => {
  try {
    const response = await api.post('/admin/credit-tariffs', tariffData);
    return response.data;
  } catch (error) {
    console.error('Ошибка при создании кредитного тарифа:', error);
    throw error;
  }
};

export const getUserAccounts = async (userId, page = 0, size = 20, status = null) => {
  try {
    const params = { page, size };
    if (status) {
      params.status = status;
    }
    
    const response = await api.get('/admin/accounts', { 
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

export const getAccountTransactions = async (accountId, page = 0, size = 20, fromDate = null, toDate = null) => {
  try {
    const params = { page, size };
    if (fromDate) {
      params.fromDate = fromDate;
    }
    if (toDate) {
      params.toDate = toDate;
    }
    
    const response = await api.get(`/accounts/${accountId}/transactions`, { params });
    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке транзакций:', error);
    throw error;
  }
};
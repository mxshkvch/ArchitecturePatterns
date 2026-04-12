export const ENDPOINTS = {
  USER_SERVICE: 'http://89.23.105.66:60882',
  CORE_SERVICE: 'http://89.23.105.66:5000',
  CREDIT_SERVICE: 'http://89.23.105.66:5107',
  SETTINGS_SERVICE: 'http://89.23.105.66:5208/api',
  AUTH_SERVICE: 'http://89.23.105.66:5001',
  
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    CREATE_USER: '/api/auth/users',
  },
  
  USER: {
    GET_ALL: '/admin/users',
    GET_BY_ID: (id) => `/admin/users/${id}`,
    
    UPDATE_STATUS: (id) => `/admin/users/${id}/status`,
    UPDATE: (id) => `/admin/users/${id}`,
    DELETE: (id) => `/admin/users/${id}`,
  },
  
  CREDIT: {
    GET_ALL: '/admin/credits',
    CREATE_TARIFF: '/admin/credit-tariffs',
    GET_RATING: (userId) => `/admin/credits/rating/${userId}`,
    GET_BY_ID: (id) => `/admin/credits/${id}`,
  },
  
  CORE: {
    GET_ACCOUNTS: '/api/admin/accounts',
    GET_ACCOUNT_BY_ID: (id) => `/api/accounts/${id}`,
    GET_TRANSACTIONS: (accountId) => `/api/accounts/${accountId}/transactions`,
    GET_MASTER_ACCOUNT: '/api/accounts/99999999-9999-9999-9999-999999999999',
  },
  
  SETTINGS: {
    GET: '/bff/settings',
    UPDATE: '/bff/settings',
  },

  PUSH_TOKENS: {
    REGISTER: '/bff/push-tokens/register',
    UNREGISTER: '/bff/push-tokens/unregister',
  },
};

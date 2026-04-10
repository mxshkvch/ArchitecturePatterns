import { coreApiClient } from '../config/axiosConfig';
import { ENDPOINTS } from '../config/endpoints';

class CoreService {
  async getUserAccounts(userId, page = 0, size = 20, status = null) {
    try {
      const params = { page, size };
      if (status) params.status = status;
      
      console.log('📡 [CoreService REAL] Fetching user accounts:', { userId, page, size, status });
      console.log('🔑 [CoreService REAL] Token:', localStorage.getItem('access_token') ? 'Present' : 'Missing');
      console.log('📍 [CoreService REAL] URL:', ENDPOINTS.CORE.GET_ACCOUNTS);
      
      const response = await coreApiClient.get(ENDPOINTS.CORE.GET_ACCOUNTS, {
        params: { ...params, userId }
      });
      
      console.log('📥 [CoreService REAL] Accounts response:', {
        status: response.status,
        dataLength: response.data?.content?.length,
        totalElements: response.data?.page?.totalElements
      });
      console.log(response.data);

      return response.data;
    } catch (error) {
      console.error('❌ [CoreService REAL] Error loading accounts:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
      throw error;
    }
  }
  
  async getAccountTransactions(accountId, page = 0, size = 10, fromDate = null, toDate = null) {
    try {
      const params = { Page: page, Size: size };
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      
      console.log('📡 [CoreService REAL] Fetching transactions:', { accountId, page, size, fromDate, toDate });
      
      const response = await coreApiClient.get(ENDPOINTS.CORE.GET_TRANSACTIONS(accountId), { params });
      
      console.log('📥 [CoreService REAL] Transactions response:', {
        status: response.status,
        dataLength: response.data?.content?.length
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ [CoreService REAL] Error loading transactions:', error);
      throw error;
    }
  }
  
  async getMasterAccount() {
    try {
      console.log('📡 [CoreService REAL] Fetching master account');
      
      const response = await coreApiClient.get(ENDPOINTS.CORE.GET_MASTER_ACCOUNT);
      
      console.log('📥 [CoreService REAL] Master account response:', {
        status: response.status,
        balance: response.data?.balance
      });
      
      return response.data;
    } catch (error) {
      console.error('❌ [CoreService REAL] Error fetching master account:', error);
      throw error;
    }
  }
  
  async getAccountById(accountId) {
    try {
      console.log('📡 [CoreService REAL] Fetching account by ID:', accountId);
      const response = await coreApiClient.get(ENDPOINTS.CORE.GET_ACCOUNT_BY_ID(accountId));
      return response.data;
    } catch (error) {
      console.error('❌ [CoreService REAL] Error loading account:', error);
      throw error;
    }
  }
}

export const coreService = new CoreService();
import { creditApiClient } from '../config/axiosConfig';
import { ENDPOINTS } from '../config/endpoints';

class CreditService {
  async getCredits(page = 1, size = 5) {
    try {
      const params = { Page: page, Size: size };
      const response = await creditApiClient.get(ENDPOINTS.CREDIT.GET_ALL, { params });
      return response.data;
    } catch (error) {

      if (error.code === 'CIRCUIT_OPEN') {
        console.error(`🔴 Service unavailable: ${error.message}`);
        throw new Error('SERVICE_TEMPORARILY_UNAVAILABLE');
      }

      console.error('❌ Error loading credits:', error);
      throw error;
    }
  }
  
  async createCreditTariff(tariffData) {
    try {
      const response = await creditApiClient.post(ENDPOINTS.CREDIT.CREATE_TARIFF, tariffData);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating credit tariff:', error);
      throw error;
    }
  }
  async getUserDelinquencies(userId, page = 1, size = 10) {
    try {
      console.log('📡 [CreditService] Fetching delinquencies for user:', { userId, page, size });
      const response = await creditApiClient.get('/admin/credits/delinquencies', {
        params: { userId, page, size }
      });
      console.log('✅ [CreditService] Delinquencies response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [CreditService] Error fetching delinquencies:', error);
      throw error;
    }
  }
  
  async getUserRating(userId) {
    try {
      if (!userId) {
        throw new Error('User ID is required');
      }
      
      console.log('📊 Fetching rating for user:', userId);
      const response = await creditApiClient.get(ENDPOINTS.CREDIT.GET_RATING(userId));
      console.log('✅ Rating response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching user rating:', error);
      throw error;
    }
  }
  
  async getCreditById(creditId) {
    try {
      const response = await creditApiClient.get(ENDPOINTS.CREDIT.GET_BY_ID(creditId));
      return response.data;
    } catch (error) {
      console.error('❌ Error loading credit:', error);
      throw error;
    }
  }
}

export const creditService = new CreditService();
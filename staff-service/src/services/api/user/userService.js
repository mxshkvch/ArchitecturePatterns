import { userApiClient } from '../config/axiosConfig';
import { ENDPOINTS } from '../config/endpoints';
import { authApiClient } from '../config/axiosConfig';
class UserService {

    async getUsers(page = 0, size = 5, role = null) {
    try {
      const params = { Page: page, Size: size };
      if (role) params.role = role;
      
      console.log('========================================');
      console.log('📡 [UserService] Request params:', params);
      console.log('========================================');
      
      const response = await userApiClient.get(ENDPOINTS.USER.GET_ALL, { params });
      
      console.log('📥 [UserService] Response status:', response.status);
      console.log('📥 [UserService] Response data:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ [UserService] Error loading users:', error);
      throw error;
    }
  } 
  
  async getUserById(userId) {
    try {
      const response = await userApiClient.get(ENDPOINTS.USER.GET_BY_ID(userId));
      return response.data;
    } catch (error) {
      console.error('❌ [UserService] Error loading user:', error);
      throw error;
    }
  }
  
  async createUser(userData) {
    try {
      console.log('📡 [AuthService] Creating user:', userData);
      console.log('📡 [AuthService] URL:', `${ENDPOINTS.AUTH_SERVICE}${ENDPOINTS.AUTH.CREATE_USER}`);
      
      const response = await authApiClient.post(ENDPOINTS.AUTH.CREATE_USER, userData);
      console.log('✅ [AuthService] User created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [AuthService] Error creating user:', {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      });
      throw error;
    }
  }
  
  async updateUserStatus(userId, status) {
    try {
      const response = await userApiClient.patch(ENDPOINTS.USER.UPDATE_STATUS(userId), { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  async updateUser(userId, userData) {
    try {
      const response = await userApiClient.put(ENDPOINTS.USER.UPDATE(userId), userData);
      return response.data;
    } catch (error) {
      console.error('❌ [UserService] Error updating user:', error);
      throw error;
    }
  }
  
  async deleteUser(userId) {
    try {
      const response = await userApiClient.delete(ENDPOINTS.USER.DELETE(userId));
      return response.data;
    } catch (error) {
      console.error('❌ [UserService] Error deleting user:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
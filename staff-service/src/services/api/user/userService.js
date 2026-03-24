import { userApiClient } from '../config/axiosConfig';
import { ENDPOINTS } from '../config/endpoints';

class UserService {

    async getUsers(page = 0, size = 5, role = null) {
    try {
      const params = { Page: page, Size: size };
      if (role) params.role = role;
      
      console.log('========================================');
      console.log('📡 [UserService] FULL REQUEST URL:', `${userApiClient.defaults.baseURL}${ENDPOINTS.USER.GET_ALL}`);
      console.log('📡 [UserService] Request params:', params);
      console.log('📡 [UserService] Full URL with params:', 
        `${userApiClient.defaults.baseURL}${ENDPOINTS.USER.GET_ALL}?${new URLSearchParams(params).toString()}`);
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
      const response = await userApiClient.post(ENDPOINTS.USER.CREATE, userData);
      return response.data;
    } catch (error) {
      console.error('❌ [UserService] Error creating user:', error);
      throw error;
    }
  }
  
  async updateUserStatus(userId, status) {
    try {
      const response = await userApiClient.patch(ENDPOINTS.USER.UPDATE_STATUS(userId), { status });
      return response.data;
    } catch (error) {
      console.error('❌ [UserService] Error updating user status:', error);
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
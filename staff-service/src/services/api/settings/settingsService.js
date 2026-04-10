import { settingsApiClient } from '../config/axiosConfig';
import { ENDPOINTS } from '../config/endpoints';

class SettingsService {
  async getSettings(applicationType = 'EMPLOYEE') {
    try {
      console.log(`📡 Fetching settings for ${applicationType}...`);
      const response = await settingsApiClient.get(ENDPOINTS.SETTINGS.GET, {
        params: { applicationType }
      });
      console.log('✅ Settings loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching settings:', error);
      return { theme: localStorage.getItem('theme') === 'dark' ? 'DARK' : 'LIGHT' };
    }
  }
  
  async updateSettings(settings) {
    try {
      console.log('📤 Updating settings:', settings);
      const response = await settingsApiClient.put(ENDPOINTS.SETTINGS.UPDATE, settings);
      console.log('✅ Settings updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating settings:', error);
      throw error;
    }
  }
}

export const settingsService = new SettingsService();

export const getSettings = (applicationType) => settingsService.getSettings(applicationType);
export const updateSettings = (settings) => settingsService.updateSettings(settings);
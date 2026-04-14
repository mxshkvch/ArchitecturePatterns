import { HttpClient } from '../core/network/http-client';

export class OAuthRepository {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
    console.log('🏗️ OAuthRepository created');
  }

  async authorize(data: any): Promise<any> {
    console.log('📤 Authorize called with:', data);
    const response = await this.httpClient.post('/connect/authorize', data);
    return response;
  }

  async getToken(data: any): Promise<any> {
    console.log('📤 GetToken called with:', data);
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    
    const response = await this.httpClient.post('/connect/token', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response;
  }

  async refreshToken(data: any): Promise<any> {
    console.log('📤 RefreshToken called');
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    
    const response = await this.httpClient.post('/connect/token', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    return response;
  }
}
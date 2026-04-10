// src/core/network/http-client.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message: string;
  timestamp: string;
}

export interface HttpClientConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}

export class HttpClient {
  private instance: AxiosInstance;

  constructor(config: HttpClientConfig) {
    this.instance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        console.log('\n🔵 ========== OUTGOING REQUEST ==========');
        console.log('🔧 Method:', config.method?.toUpperCase());
        console.log('📋 Headers:', JSON.stringify(config.headers, null, 2));
        
        // Логируем тело запроса в зависимости от типа
        if (config.data instanceof FormData) {
          console.log('📦 Body: [FormData]');
          // Логируем содержимое FormData
          const formDataObj: Record<string, any> = {};
          config.data.forEach((value: any, key: string) => {
            formDataObj[key] = value;
          });
          console.log('FormData content:', JSON.stringify(formDataObj, null, 2));
        } else if (config.data) {
          console.log('📦 Body:', JSON.stringify(config.data, null, 2));
        } else {
          console.log('📦 Body: [empty]');
        }
        
        console.log('==========================================\n');
        return config;
      },
      (error) => {
        console.error('\n🔴 REQUEST ERROR:', error);
        return Promise.reject(error);
      }
    );
// src/core/network/http-client.ts (добавьте в response interceptor)
// В методе setupInterceptors, в response interceptor добавьте логирование:

this.instance.interceptors.response.use(
  (response) => {
    console.log('\n🟢 ========== INCOMING RESPONSE ==========');
    console.log('📍 URL:', response.config.url);
    console.log('📊 Status:', response.status);
    console.log('📦 Full Response:', response);
    console.log('📦 Response Data:', JSON.stringify(response.data, null, 2));
    console.log('==========================================\n');
    
    // Возвращаем response, чтобы можно было получить доступ к response.data
    return response;
  },
  (error: AxiosError) => {
    console.error('\n🔴 ========== RESPONSE ERROR ==========');
    console.error('📍 URL:', error.config?.url);
    console.error('📊 Status:', error.response?.status);
    console.error('📦 Response Data:', error.response?.data);
    console.error('📦 Full Error:', error);
    console.error('========================================\n');
    
    if (error.response) {
      const errorData = error.response.data as any;
      const errorMessage = errorData?.message || error.message;
      const enhancedError = new Error(errorMessage);
      (enhancedError as any).status = error.response.status;
      (enhancedError as any).data = errorData;
      return Promise.reject(enhancedError);
    }
    return Promise.reject(error);
  }
);
    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        console.log('\n🟢 ========== INCOMING RESPONSE ==========');
        console.log('📍 URL:', response.config.url);
        console.log('📊 Status:', response.status);
        console.log('📦 Data:', JSON.stringify(response.data, null, 2));
        console.log('==========================================\n');
        return response;
      },
      (error: AxiosError) => {
        console.error('\n🔴 ========== RESPONSE ERROR ==========');
        console.error('📍 URL:', error.config?.url);
        console.error('📊 Status:', error.response?.status);
        console.error('📦 Response Data:', error.response?.data);
        
        if (error.config?.data) {
          if (error.config.data instanceof FormData) {
            const formDataObj: Record<string, any> = {};
            error.config.data.forEach((value: any, key: string) => {
              formDataObj[key] = value;
            });
            console.error('📤 Request Body (FormData):', JSON.stringify(formDataObj, null, 2));
          } else {
            console.error('📤 Request Body:', error.config.data);
          }
        }
        
        console.error('========================================\n');
        
        if (error.response) {
          const errorData = error.response.data as any;
          const errorMessage = errorData?.message || error.message;
          const enhancedError = new Error(errorMessage);
          (enhancedError as any).status = error.response.status;
          (enhancedError as any).data = errorData;
          return Promise.reject(enhancedError);
        }
        return Promise.reject(error);
      }
    );
  }

  public setAuthToken(token: string | null): void {
    if (token) {
      this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.instance.defaults.headers.common['Authorization'];
    }
  }

  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }
}
// src/core/di/container.ts
import { HttpClient } from '../network/http-client';
import { OAuthRepository } from '../../repositories/oauth.repository';
import { AuthUseCases } from '../../use-cases/auth.use-cases';
import { NotificationService } from '../notifications/notification.service';
import { config } from '../../config/env';

export class DIContainer {
  private static instance: DIContainer;
  private services: Map<string, any> = new Map();
  private singletons: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
      console.log('🏭 DIContainer instance created');
    }
    return DIContainer.instance;
  }

  register<T>(token: string, service: T, singleton: boolean = false): void {
    if (singleton) {
      this.singletons.set(token, service);
      console.log(`📝 Registered singleton: ${token}`);
    } else {
      this.services.set(token, service);
      console.log(`📝 Registered service: ${token}`);
    }
  }

  resolve<T>(token: string): T {
    if (this.singletons.has(token)) {
      return this.singletons.get(token);
    }
    
    if (this.services.has(token)) {
      return this.services.get(token);
    }
    
    console.error(`❌ Service ${token} not found`);
    console.log('Available singletons:', Array.from(this.singletons.keys()));
    console.log('Available services:', Array.from(this.services.keys()));
    throw new Error(`Service ${token} not found`);
  }

  has(token: string): boolean {
    return this.services.has(token) || this.singletons.has(token);
  }

  getAllServices(): string[] {
    return [...Array.from(this.services.keys()), ...Array.from(this.singletons.keys())];
  }
}

// Initialize all services
export const initializeDI = () => {
  console.log('🔧 ===== INITIALIZING DI CONTAINER =====');
  const container = DIContainer.getInstance();
  
  try {
    // HTTP Client
    console.log('Creating HttpClient...');
    const httpClient = new HttpClient({
      baseURL: config.apiUrl,
      timeout: 10000,
    });
    container.register('HttpClient', httpClient, true);
    
    // Repositories
    console.log('Creating OAuthRepository...');
    const oauthRepository = new OAuthRepository(httpClient);
    container.register('OAuthRepository', oauthRepository, true);
    
    // Services
    console.log('Getting NotificationService...');
    const notificationService = NotificationService.getInstance();
    container.register('NotificationService', notificationService, true);
    
    // Use Cases
    console.log('Creating AuthUseCases...');
    const authUseCases = new AuthUseCases(oauthRepository, notificationService);
    container.register('AuthUseCases', authUseCases, true);
    
    // Проверяем регистрацию
    console.log('\n📋 Registration verification:');
    console.log('HttpClient:', container.has('HttpClient'));
    console.log('OAuthRepository:', container.has('OAuthRepository'));
    console.log('NotificationService:', container.has('NotificationService'));
    console.log('AuthUseCases:', container.has('AuthUseCases'));
    
    console.log('\n✅ All services registered:', container.getAllServices());
    console.log('🔧 ===== DI CONTAINER INITIALIZED =====\n');
    
  } catch (error) {
    console.error('❌ Error initializing DI:', error);
    throw error;
  }
};
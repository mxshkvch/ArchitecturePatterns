// src/core/di/simple-container.ts
import { NotificationService } from '../notifications/notification.service';
import { config } from '../../config/env';

export class SimpleAuthUseCases {
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    console.log('🏗️ SimpleAuthUseCases created');
    this.notificationService = notificationService;
  }

  async login(credentials: { email: string; password: string; role: 'client' | 'staff' }) {
    console.log('🔐 Login attempt:', credentials);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Генерируем токены
    const accessToken = this.generateToken(credentials.email, credentials.role);
    const refreshToken = this.generateToken(credentials.email, 'refresh');
    
    // Сохраняем в localStorage
    localStorage.setItem('user_role', credentials.role);
    localStorage.setItem('is_authenticated', 'true');
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user_email', credentials.email);
    
    // Формируем URL с токеном для передачи в дочернее приложение
    const redirectUrl = credentials.role === 'client' 
      ? config.clientBankUrl 
      : config.staffServiceUrl;
    
    // Добавляем токен в URL как параметр
    const urlWithToken = `${redirectUrl}?token=${encodeURIComponent(accessToken)}&role=${credentials.role}`;
    
    console.log('✅ Login success, redirecting with token to:', urlWithToken);
    this.notificationService.success(`Login successful! Redirecting to ${credentials.role} portal...`);
    
    return { redirectTo: urlWithToken };
  }

  private generateToken(email: string, role: string): string {
    // Простая генерация токена (в реальном приложении используйте JWT)
    const payload = {
      email,
      role,
      exp: Date.now() + 3600000, // 1 час
      iat: Date.now()
    };
    // base64 кодирование для имитации JWT
    return btoa(JSON.stringify(payload));
  }

  logout() {
    localStorage.removeItem('user_role');
    localStorage.removeItem('is_authenticated');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_email');
    this.notificationService.info('Logged out successfully');
  }

  isAuthenticated() {
    return localStorage.getItem('is_authenticated') === 'true';
  }

  getUserRole() {
    return localStorage.getItem('user_role') as 'client' | 'staff' | null;
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }
}
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
    
    const accessToken = this.generateToken(credentials.email, credentials.role);
    const refreshToken = this.generateToken(credentials.email, 'refresh');
    
    localStorage.setItem('user_role', credentials.role);
    localStorage.setItem('is_authenticated', 'true');
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user_email', credentials.email);
    
    const redirectUrl = credentials.role === 'client' 
      ? config.clientBankUrl 
      : config.staffServiceUrl;
    
    const urlWithToken = `${redirectUrl}?token=${encodeURIComponent(accessToken)}&role=${credentials.role}`;
    
    console.log('✅ Login success, redirecting with token to:', urlWithToken);
    this.notificationService.success(`Login successful! Redirecting to ${credentials.role} portal...`);
    
    return { redirectTo: urlWithToken };
  }

  private generateToken(email: string, role: string): string {
    const payload = {
      email,
      role,
      exp: Date.now() + 3600000, 
      iat: Date.now()
    };
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
import { TokenStorage } from '../core/auth/token-storage';
import { NotificationService } from '../core/notifications/notification.service';
import { config } from '../config/env';
import { OAuthRepository } from '../repositories/oauth.repository';

export interface LoginCredentials {
  email: string;
  password: string;
  role: 'client' | 'staff';
}

export class AuthUseCases {
  private tokenStorage: TokenStorage;
  private notificationService: NotificationService;
  private oauthRepository: OAuthRepository;

  constructor(
    oauthRepository: OAuthRepository,
    notificationService: NotificationService
  ) {
    console.log('🏗️ Creating AuthUseCases instance with constructor');
    this.oauthRepository = oauthRepository;
    this.notificationService = notificationService;
    this.tokenStorage = TokenStorage.getInstance();
    console.log('✅ AuthUseCases instance created');
  }

 
  private getRedirectUrl(role: 'client' | 'staff'): string {
  const url = role === 'client' ? config.clientBankUrl : config.staffServiceUrl;
  console.log('🎯 getRedirectUrl called with role:', role);
  console.log('🎯 Returning URL:', url);
  console.log('🎯 Config clientBankUrl:', config.clientBankUrl);
  console.log('🎯 Config staffServiceUrl:', config.staffServiceUrl);
  return url;
}

  async login(credentials: LoginCredentials): Promise<{ redirectTo: string; accessToken: string }> {
    console.log('🔐 Login attempt:', credentials);
    
    try {
      console.log('📡 Step 1: Requesting authorization code...');
      const authResponse = await this.oauthRepository.authorize({
        clientId: config.clientId,
        redirectUri: config.redirectUri,
        state: Math.random().toString(36).substring(7),
        scope: 'openid profile email',
        email: credentials.email,
        password: credentials.password
      });
      
      console.log('📥 ===== AUTH RESPONSE START =====');
      console.log('Full auth response:', JSON.stringify(authResponse, null, 2));
      console.log('Auth response type:', typeof authResponse);
      console.log('Auth response keys:', Object.keys(authResponse));
      
      if (authResponse.data) {
        console.log('Auth response.data keys:', Object.keys(authResponse.data));
        console.log('Auth response.data.code:', authResponse.data.code);
      }
      
      console.log('Auth response.code (direct):', authResponse.code);
      console.log('📥 ===== AUTH RESPONSE END =====');
      
      const code = authResponse?.data?.code || authResponse?.code;
      
      if (!code) {
        console.error('❌ No code in response:', authResponse);
        throw new Error('No authorization code received from server');
      }
      
      console.log('✅ Authorization code received:', code);
      
      console.log('\n🔄 Step 2: Exchanging code for tokens...');
      console.log('Sending token request with data:', {
        grant_type: 'authorization_code',
        client_id: config.clientId,
        client_secret: '***HIDDEN***',
        scope: 'openid profile email',
        code: code,
        redirect_uri: config.redirectUri
      });
      
      const tokenResponse = await this.oauthRepository.getToken({
        grant_type: 'authorization_code',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        scope: 'openid profile email',
        code: code,
        redirect_uri: config.redirectUri
      });
      
      console.log('\n📥 ===== TOKEN RESPONSE START =====');
      console.log('Full token response:', JSON.stringify(tokenResponse, null, 2));
      console.log('Token response type:', typeof tokenResponse);
      console.log('Token response keys:', Object.keys(tokenResponse));
      
      if (tokenResponse.data) {
        console.log('Token response.data keys:', Object.keys(tokenResponse.data));
        console.log('Token response.data.access_token:', tokenResponse.data.access_token ? '✅ Present' : '❌ Missing');
        console.log('Token response.data.expires_in:', tokenResponse.data.expires_in);
        console.log('Token response.data.refresh_token:', tokenResponse.data.refresh_token ? '✅ Present' : '❌ Missing');
      }
      
      console.log('Token response.access_token (direct):', tokenResponse.access_token ? '✅ Present' : '❌ Missing');
      console.log('📥 ===== TOKEN RESPONSE END =====\n');
      
      const accessToken = tokenResponse?.data?.access_token || tokenResponse?.access_token;
      const refreshToken = tokenResponse?.data?.refresh_token || tokenResponse?.refresh_token;
      const expiresIn = tokenResponse?.data?.expires_in || tokenResponse?.expires_in;
      
      if (!accessToken) {
        console.error('❌ No access token in response:', tokenResponse);
        throw new Error('No access token received from server');
      }
      
      console.log('✅ Access token received successfully!');
      console.log('📝 Token details:');
      console.log('  - Access Token (first 50 chars):', accessToken.substring(0, 50) + '...');
      console.log('  - Expires in:', expiresIn, 'seconds');
      console.log('  - Refresh Token present:', !!refreshToken);
      
      console.log('\n💾 Step 3: Saving tokens...');
      this.tokenStorage.saveTokens({
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: expiresIn
      });
      
      this.tokenStorage.saveUserRole(credentials.role);
      this.tokenStorage.saveClientId(config.clientId);
      
      console.log('✅ Tokens saved successfully!');
      
      const savedToken = this.tokenStorage.getAccessToken();
      console.log('🔍 Verifying saved token:', savedToken ? '✅ Present' : '❌ Missing');
      
      this.notificationService.success(`Login successful! Welcome ${credentials.email}`);
      
      const redirectTo = this.getRedirectUrl(credentials.role);
      console.log('\n🚀 Step 4: Ready to redirect');
      console.log('  - Redirect URL:', redirectTo);
      console.log('  - Access Token:', accessToken.substring(0, 50) + '...');
      console.log('  - User Role:', credentials.role);
      
      console.log('\n⚠️ [DEBUG] REDIRECT IS DISABLED FOR TESTING ⚠️');
      console.log('Would redirect to:', redirectTo);
      console.log('With token:', accessToken.substring(0, 50) + '...');
      console.log('With role:', credentials.role);
      console.log('\n💡 Check browser console and localStorage for saved data:');
      console.log('  - localStorage.getItem("auth_tokens"):', localStorage.getItem('auth_tokens'));
      console.log('  - localStorage.getItem("user_role"):', localStorage.getItem('user_role'));
      console.log('  - localStorage.getItem("client_id"):', localStorage.getItem('client_id'));
      
      return { 
        redirectTo, 
        accessToken: accessToken 
      };
      
    } catch (error) {
      console.error('\n❌ ===== LOGIN ERROR =====');
      console.error('Error details:', error);
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      console.error('❌ ======================\n');
      
      this.notificationService.error('Login failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      throw error;
    }
  }

  logout(): void {
    console.log('🚪 Logging out');
    this.tokenStorage.clearTokens();
    this.notificationService.info('Logged out successfully');
  }

  isAuthenticated(): boolean {
    const isAuth = this.tokenStorage.isAuthenticated();
    console.log('🔐 isAuthenticated:', isAuth);
    return isAuth;
  }

  getUserRole(): 'client' | 'staff' | 'admin' | null {
    const role = this.tokenStorage.getUserRole();
    console.log('👤 getUserRole:', role);
    return role;
  }

  getAccessToken(): string | null {
    return this.tokenStorage.getAccessToken();
  }

  
}
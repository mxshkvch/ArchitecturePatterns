import { TokenResponseDto } from '../../types/dto/auth.dto';

const TOKEN_KEY = 'auth_tokens';
const ROLE_KEY = 'user_role';
const CLIENT_ID_KEY = 'client_id';

export interface StoredTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export class TokenStorage {
  private static instance: TokenStorage;

  private constructor() {}

  static getInstance(): TokenStorage {
    if (!TokenStorage.instance) {
      TokenStorage.instance = new TokenStorage();
    }
    return TokenStorage.instance;
  }

  saveTokens(tokens: TokenResponseDto): void {
    console.log('💾 Saving tokens');
    const storedTokens: StoredTokens = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    };
    
    localStorage.setItem(TOKEN_KEY, JSON.stringify(storedTokens));
  }

  getTokens(): StoredTokens | null {
    const tokensJson = localStorage.getItem(TOKEN_KEY);
    if (!tokensJson) return null;
    
    try {
      const tokens = JSON.parse(tokensJson) as StoredTokens;
      
      if (tokens.expiresAt < Date.now()) {
        console.log('⏰ Tokens expired');
        this.clearTokens();
        return null;
      }
      
      return tokens;
    } catch {
      return null;
    }
  }

  getAccessToken(): string | null {
    const tokens = this.getTokens();
    return tokens?.accessToken || null;
  }

  getRefreshToken(): string | null {
    const tokens = this.getTokens();
    return tokens?.refreshToken || null;
  }

  saveUserRole(role: 'client' | 'staff' | 'admin'): void {
    console.log('💾 Saving user role:', role);
    localStorage.setItem(ROLE_KEY, role);
  }

  getUserRole(): 'client' | 'staff' | 'admin' | null {
    const role = localStorage.getItem(ROLE_KEY);
    console.log('📖 Retrieved user role:', role);
    if (role && (role === 'client' || role === 'staff' || role === 'admin')) {
      return role;
    }
    return null;
  }

  saveClientId(clientId: string): void {
    console.log('💾 Saving clientId:', clientId);
    localStorage.setItem(CLIENT_ID_KEY, clientId);
  }

  getClientId(): string | null {
    return localStorage.getItem(CLIENT_ID_KEY);
  }

  clearTokens(): void {
    console.log('🗑️ Clearing all tokens');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(CLIENT_ID_KEY);
  }

  isAuthenticated(): boolean {
    const tokens = this.getTokens();
    const isAuth = tokens !== null && tokens.expiresAt > Date.now();
    console.log('🔐 isAuthenticated:', isAuth);
    return isAuth;
  }
}
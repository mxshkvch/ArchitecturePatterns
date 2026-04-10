// src/types/dto/auth.dto.ts
export interface AuthorizeRequestDto {
  clientId: string;
  redirectUri: string;
  state: string;
  scope: string;
  email: string;
  password: string;
}

export interface AuthorizeResponseDto {
  code: string;
  state: string;
  redirect_uri: string;
}

export interface TokenRequestDto {
  grant_type: 'authorization_code';
  client_id: string;
  client_secret: string;
  scope: string;
  code: string;
  redirectUri: string;
}

export interface TokenResponseDto {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  token_type?: string;
  scope?: string;
}

export interface RefreshTokenRequestDto {
  grant_type: 'refresh_token';
  client_id: string;
  client_secret: string;
  refresh_token: string;
  scope?: string;
}

export interface UserRole {
  role: 'client' | 'staff' | 'admin';
  permissions: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  userRole: UserRole | null;
}
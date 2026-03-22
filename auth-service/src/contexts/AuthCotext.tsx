// src/contexts/AuthContext.tsx (исправленная версия с редиректом)
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as React from 'react';
import { DIContainer } from '../core/di/container';
import { AuthUseCases } from '../use-cases/auth.use-cases';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: 'client' | 'staff' | 'admin' | null;
  login: (email: string, password: string, role: 'client' | 'staff') => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'client' | 'staff' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authUseCases, setAuthUseCases] = useState<AuthUseCases | null>(null);

  useEffect(() => {
    console.log('🔧 AuthProvider mounting...');
    
    try {
      const container = DIContainer.getInstance();
      console.log('📦 DI Container obtained');
      
      const hasAuth = container.has('AuthUseCases');
      console.log('🔍 Has AuthUseCases:', hasAuth);
      
      if (hasAuth) {
        const useCases = container.resolve<AuthUseCases>('AuthUseCases');
        console.log('✅ AuthUseCases resolved');
        setAuthUseCases(useCases);
        
        // Проверяем статус
        const authenticated = useCases.isAuthenticated();
        const role = useCases.getUserRole();
        
        setIsAuthenticated(authenticated);
        setUserRole(role);
        console.log('📊 Auth state:', { authenticated, role });
      } else {
        console.error('❌ AuthUseCases not found in DI container');
        console.log('Available services:', container.getAllServices());
        setError('Authentication service not available');
      }
    } catch (err) {
      console.error('❌ Error initializing auth:', err);
      setError(`Failed to initialize: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }, []);

 const login = useCallback(async (email: string, password: string, role: 'client' | 'staff') => {
  if (!authUseCases) {
    throw new Error('AuthUseCases not initialized');
  }
  
  try {
    setLoading(true);
    setError(null);
    
    console.log('🔐 Login attempt with role:', role);
    const { redirectTo, accessToken } = await authUseCases.login({ email, password, role });
    
    setIsAuthenticated(true);
    setUserRole(role);
    
    // Формируем URL с токеном
    const urlWithToken = `${redirectTo}?token=${encodeURIComponent(accessToken)}&role=${role}`;
    
    console.log('\n🔴 ===== REDIRECT INFO =====');
    console.log('Redirect URL:', urlWithToken);
    console.log('Token length:', accessToken.length);
    console.log('Role:', role);
    console.log('🔴 =========================\n');
    
    // Убеждаемся, что URL корректен
    if (!urlWithToken || urlWithToken === 'undefined?token=undefined&role=undefined') {
      console.error('❌ Invalid redirect URL!');
      throw new Error('Invalid redirect URL');
    }
    
    // Добавляем задержку и принудительный редирект
    console.log('⏳ Waiting 1 second before redirect...');
    setTimeout(() => {
      console.log('🚀 EXECUTING REDIRECT TO:', urlWithToken);
      window.location.replace(urlWithToken); // Используем replace вместо href
    }, 1000);
    
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Login failed';
    console.error('❌ Login error:', errorMessage);
    setError(errorMessage);
    throw err;
  } finally {
    setLoading(false);
  }
}, [authUseCases]);

  const logout = useCallback(() => {
    if (!authUseCases) return;
    
    authUseCases.logout();
    setIsAuthenticated(false);
    setUserRole(null);
    window.location.href = '/login';
  }, [authUseCases]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      userRole,
      login,
      logout,
      loading,
      error,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
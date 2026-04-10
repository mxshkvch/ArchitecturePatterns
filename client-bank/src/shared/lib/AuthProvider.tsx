import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: string | null;
  userEmail: string | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, role: string, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ALLOWED_ROLES = ['client', 'CLIENT'];

const decodeJWT = (token: string) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      console.error('Invalid JWT token format');
      return null;
    }
    

    let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (payload.length % 4) {
      payload += '=';
    }
    
    const decoded = decodeURIComponent(atob(payload).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

const getTokenFromUrl = () => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const role = params.get('role');
  
  console.log('🔍 getTokenFromUrl called');
  console.log('  - URL:', window.location.href);
  console.log('  - token param:', token ? `${token.substring(0, 50)}...` : 'not found');
  console.log('  - role param:', role || 'not found');
  
  if (token && role && ALLOWED_ROLES.includes(role.toLowerCase())) {
    const decoded = decodeJWT(token);
    if (decoded) {
      console.log('✅ Token decoded:', {
        email: decoded.email,
        role: decoded.role,
        nameid: decoded.nameid,
        exp: new Date(decoded.exp * 1000).toLocaleString(),
        nbf: new Date(decoded.nbf * 1000).toLocaleString(),
        iat: new Date(decoded.iat * 1000).toLocaleString()
      });
      
      return { 
        token, 
        role: role.toLowerCase(), 
        email: decoded.email,
        decoded 
      };
    } else {
      console.error('❌ Failed to decode token');
      return null;
    }
  }
  
  return null;
};

const checkAuth = () => {
  const storedToken = localStorage.getItem('accessToken');
  const storedRole = localStorage.getItem('userRole');
  
  console.log('📦 checkAuth:', { storedToken: !!storedToken, storedRole });
  
  if (!storedToken || !storedRole || !ALLOWED_ROLES.includes(storedRole.toLowerCase())) {
    return false;
  }
  
  const decoded = decodeJWT(storedToken);
  if (decoded && decoded.exp) {
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      console.log('⏰ Token expired at:', new Date(decoded.exp * 1000).toLocaleString());
      return false;
    }
    return true;
  }
  
  return false;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  console.log('🏗️ AuthProvider rendering, isLoading:', isLoading);

  useEffect(() => {
    console.log('\n🔐 ===== CLIENT-BANK AUTH INIT =====');
    
    const urlToken = getTokenFromUrl();
    if (urlToken) {
      console.log('✅ Token received from URL');
      
      localStorage.setItem('accessToken', urlToken.token);
      localStorage.setItem('userRole', urlToken.role);
      localStorage.setItem('userEmail', urlToken.email);
      
      setIsAuthenticated(true);
      setUserRole(urlToken.role);
      setUserEmail(urlToken.email);
      setToken(urlToken.token);
      setIsLoading(false);
      
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log('✅ Token saved, URL cleaned');
      return;
    }
    
    const storedToken = localStorage.getItem('accessToken');
    const storedRole = localStorage.getItem('userRole');
    const storedEmail = localStorage.getItem('userEmail');
    
    console.log('📦 Checking localStorage:');
    console.log('  - accessToken:', storedToken ? 'present' : 'missing');
    console.log('  - userRole:', storedRole || 'missing');
    console.log('  - userEmail:', storedEmail || 'missing');
    
    if (storedToken && storedRole && ALLOWED_ROLES.includes(storedRole.toLowerCase())) {
      const decoded = decodeJWT(storedToken);
      if (decoded && decoded.exp) {
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp < now) {
          console.log('⏰ Token expired, clearing...');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userEmail');
        } else {
          console.log('✅ Session restored from localStorage');
          setIsAuthenticated(true);
          setUserRole(storedRole.toLowerCase());
          setUserEmail(storedEmail);
          setToken(storedToken);
        }
      }
    } else {
      if (storedRole && !ALLOWED_ROLES.includes(storedRole.toLowerCase())) {
        console.log('⚠️ Invalid role for client-bank:', storedRole);
        localStorage.removeItem('userRole');
      }
      console.log('❌ No valid session found');
    }
    
    setIsLoading(false);
    console.log('🔐 ===== AUTH INIT COMPLETE =====\n');
  }, []);

  const login = (newToken: string, role: string, email: string) => {
    console.log('🔐 Login called with:', { role, email });
    localStorage.setItem('accessToken', newToken);
    localStorage.setItem('userRole', role);
    localStorage.setItem('userEmail', email);
    setIsAuthenticated(true);
    setUserRole(role);
    setUserEmail(email);
    setToken(newToken);
  };

  const logout = () => {
    console.log('🚪 Logging out from client-bank');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setUserRole(null);
    setUserEmail(null);
    setToken(null);
    window.location.href = 'http://localhost:5175/login';
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      userRole,
      userEmail,
      token,
      isLoading,
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('❌ useAuth called outside of AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
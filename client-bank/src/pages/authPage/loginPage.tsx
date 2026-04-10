import React, { useEffect } from 'react';
import { useAuth } from '../../shared/lib//AuthProvider';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    console.log('🔐 LoginPage mounted', { isAuthenticated, isLoading });
    
    if (!isLoading && isAuthenticated) {
      console.log('✅ Already authenticated, redirecting to dashboard');
      window.location.href = '/';
      return;
    }
    
    if (!isLoading && !isAuthenticated) {
      console.log('🔐 Redirecting to auth service...');
    }
  }, [isAuthenticated, isLoading]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '20px'
    }}>
      <div className="spinner"></div>
      <p>Redirecting to login page...</p>
    </div>
  );
};
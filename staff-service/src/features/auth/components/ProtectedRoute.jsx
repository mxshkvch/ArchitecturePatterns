import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../../../services/api';

export const ProtectedRoute = ({ children }) => {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('access_token');
      const role = localStorage.getItem('user_role');
      
      console.log('🔐 ProtectedRoute check:', {
        hasToken: !!token,
        role: role,
        tokenPreview: token ? token.substring(0, 50) + '...' : null
      });
      
      const auth = isAuthenticated();
      console.log('🔐 isAuthenticated result:', auth);
      
      setAuthenticated(auth);
      setChecking(false);
    };
    
    checkAuth();
  }, []);

  if (checking) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p>Проверка доступа...</p>
      </div>
    );
  }

  if (!authenticated) {
    console.log('🔐 ProtectedRoute: Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  console.log('🔐 ProtectedRoute: Authenticated, rendering children');
  return children;
};

const styles = {
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '16px'
  }
};

if (!document.querySelector('#protected-spinner-styles')) {
  const style = document.createElement('style');
  style.id = 'protected-spinner-styles';
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
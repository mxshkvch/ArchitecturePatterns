// staff-service/src/features/auth/pages/Login.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, initializeAuth } from '../../../services/api';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    console.log('========================================');
    console.log('🔧 LOGIN COMPONENT MOUNTED');
    console.log('========================================');
    
    console.log('📍 Current URL:', window.location.href);
    console.log('📍 Current pathname:', window.location.pathname);
    console.log('📍 Current search params:', window.location.search);
    console.log('📍 Location from React Router:', location);
    
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const roleFromUrl = urlParams.get('role');
    
    console.log('\n🔍 URL PARAMETERS:');
    console.log('  - token parameter present:', !!tokenFromUrl);
    console.log('  - token value (first 50 chars):', tokenFromUrl ? tokenFromUrl.substring(0, 50) + '...' : 'null');
    console.log('  - role parameter:', roleFromUrl);
    console.log('  - all parameters:', Array.from(urlParams.entries()));
    
    // 3. Логируем текущий localStorage
    console.log('\n💾 LOCALSTORAGE BEFORE INIT:');
    console.log('  - access_token:', localStorage.getItem('access_token') ? 'present' : 'missing');
    console.log('  - user_role:', localStorage.getItem('user_role'));
    console.log('  - user_email:', localStorage.getItem('user_email'));
    console.log('  - user_id:', localStorage.getItem('user_id'));
    console.log('  - user:', localStorage.getItem('user'));
    
    // 4. Вызываем initializeAuth
    console.log('\n🚀 CALLING initializeAuth()...');
    const hasToken = initializeAuth();
    console.log('  - initializeAuth returned:', hasToken);
    
    // 5. Логируем localStorage после initializeAuth
    console.log('\n💾 LOCALSTORAGE AFTER INIT:');
    console.log('  - access_token:', localStorage.getItem('access_token') ? 'present' : 'missing');
    if (localStorage.getItem('access_token')) {
      console.log('    value (first 50 chars):', localStorage.getItem('access_token').substring(0, 50) + '...');
    }
    console.log('  - user_role:', localStorage.getItem('user_role'));
    console.log('  - user_email:', localStorage.getItem('user_email'));
    console.log('  - user_id:', localStorage.getItem('user_id'));
    console.log('  - user:', localStorage.getItem('user'));
    
    // 6. Проверяем аутентификацию
    console.log('\n🔐 CALLING isAuthenticated()...');
    const authenticated = isAuthenticated();
    console.log('  - isAuthenticated returned:', authenticated);
    
    // 7. Сохраняем отладочную информацию
    setDebugInfo({
      url: window.location.href,
      pathname: location.pathname,
      tokenInUrl: !!tokenFromUrl,
      tokenValue: tokenFromUrl ? tokenFromUrl.substring(0, 100) + '...' : null,
      roleInUrl: roleFromUrl,
      tokenSaved: !!localStorage.getItem('access_token'),
      userRole: localStorage.getItem('user_role'),
      userEmail: localStorage.getItem('user_email'),
      userId: localStorage.getItem('user_id'),
      isAuthenticated: authenticated,
      hasToken: hasToken,
      timestamp: new Date().toISOString()
    });
    
    // 8. Принимаем решение
    console.log('\n🤔 DECISION MAKING:');
    console.log('  - authenticated:', authenticated);
    console.log('  - hasToken:', hasToken);
    console.log('  - tokenFromUrl:', !!tokenFromUrl);
    console.log('  - roleFromUrl:', roleFromUrl);
    
    if (authenticated) {
      console.log('✅ User authenticated, redirecting to /users in 1 second...');
      setTimeout(() => {
        console.log('🔄 Executing redirect to /users');
        navigate('/users', { replace: true });
      }, 1000);
    } else if (hasToken || tokenFromUrl) {
      // Если есть токен но не аутентифицирован - возможно ошибка валидации
      console.log('⚠️ Token found but authentication failed, redirecting to /users anyway');
      setTimeout(() => {
        navigate('/users', { replace: true });
      }, 1000);
    } else {
      const errorMsg = 'No authentication token found. Redirecting to auth service login...';
      console.log('❌', errorMsg);
      setError(errorMsg);
      console.log('🔄 Will redirect to http://localhost:5175/login in 3 seconds...');
      setTimeout(() => {
        console.log('🔄 Executing redirect to auth service');
        window.location.href = 'http://localhost:5175/login';
      }, 3000);
    }
    
    setLoading(false);
    console.log('\n========================================');
    console.log('🔧 LOGIN COMPONENT FINISHED MOUNTING');
    console.log('========================================\n');
  }, [navigate, location]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h2 style={styles.title}>🏦 Staff Service</h2>
          <div className="spinner" style={styles.spinner}></div>
          <p style={styles.text}>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🏦 Staff Service</h2>
        
        {error && (
          <div style={styles.errorBox}>
            <p style={styles.errorIcon}>⚠️</p>
            <p style={styles.errorMessage}>{error}</p>
          </div>
        )}
        
        <div style={styles.debugBox}>
          <h3 style={styles.debugTitle}>🔍 Debug Information:</h3>
          <pre style={styles.debugContent}>
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
        
        {!error && (
          <>
            <div className="spinner" style={styles.spinner}></div>
            <p style={styles.text}>Authenticating...</p>
          </>
        )}
        
        {error && (
          <p style={styles.redirectNote}>Redirecting to login page...</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    maxWidth: '600px',
    width: '90%',
  },
  title: {
    margin: '0 0 20px 0',
    color: '#333',
    fontSize: '24px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    margin: '20px auto',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  text: {
    color: '#666',
    marginTop: '10px',
  },
  errorBox: {
    backgroundColor: '#f8d7da',
    border: '1px solid #f5c6cb',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
  },
  errorIcon: {
    fontSize: '24px',
    margin: '0 0 10px 0',
  },
  errorMessage: {
    color: '#721c24',
    margin: '0',
    fontWeight: 'bold',
  },
  debugBox: {
    backgroundColor: '#f4f4f4',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '15px',
    marginTop: '20px',
    textAlign: 'left',
  },
  debugTitle: {
    fontSize: '14px',
    margin: '0 0 10px 0',
    color: '#333',
  },
  debugContent: {
    fontSize: '12px',
    backgroundColor: '#fff',
    padding: '10px',
    borderRadius: '4px',
    overflow: 'auto',
    maxHeight: '200px',
    margin: '0',
    fontFamily: 'monospace',
  },
  redirectNote: {
    marginTop: '20px',
    color: '#666',
    fontSize: '12px',
  },
};

// Добавляем анимацию
if (!document.querySelector('#login-styles')) {
  const style = document.createElement('style');
  style.id = 'login-styles';
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default Login;
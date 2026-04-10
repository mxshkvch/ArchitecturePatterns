import React, { useEffect } from 'react';

const Login = () => {
  useEffect(() => {
    console.log('🔐 Login component mounted');
    console.log('Current URL:', window.location.href);
    
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const role = urlParams.get('role');
    
    console.log('Token from URL:', token ? 'YES (length: ' + token.length + ')' : 'NO');
    console.log('Role from URL:', role);
    
    if (token && role === 'staff') {
      console.log('✅ Valid token found, saving to localStorage...');
      
      localStorage.setItem('access_token', token);
      localStorage.setItem('token', token);
      localStorage.setItem('user_role', role);
      console.log(228);
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          console.log('📦 Decoded token payload:', payload);
          
          if (payload.email) {
            localStorage.setItem('user_email', payload.email);
            console.log('Email saved:', payload.email);
          }
          if (payload.nameid) {
            localStorage.setItem('user_id', payload.nameid);
            console.log('User ID saved:', payload.nameid);
          }
          if (payload.role) {
            localStorage.setItem('user_role_from_token', payload.role);
            console.log('Role from token:', payload.role);
          }
          
          const user = {
            id: payload.nameid,
            email: payload.email,
            role: payload.role,
            firstName: payload.firstName || '',
            lastName: payload.lastName || ''
          };
          localStorage.setItem('user', JSON.stringify(user));
          console.log('User object saved');
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
      }
      
      window.history.replaceState({}, document.title, window.location.pathname);
      console.log('🧹 URL cleaned');
      
      const savedToken = localStorage.getItem('access_token');
      console.log('✅ Verification - Token saved:', !!savedToken);
      console.log('✅ Verification - User role:', localStorage.getItem('user_role'));
      console.log('✅ Verification - User email:', localStorage.getItem('user_email'));
      
      console.log('🔄 Redirecting to /users...');
      setTimeout(() => {
        window.location.href = '/users';
      }, 500);
      
    } else {
      console.log('❌ No valid token found, redirecting to auth service...');
      console.log('Token present:', !!token);
      console.log('Role expected: staff, got:', role);
      
      setTimeout(() => {
       window.location.href = 'http://localhost:5175/login';
      }, 2000);
    }
  }, []);
  
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🏦</div>
        <div className="spinner" style={styles.spinner}></div>
        <p style={styles.text}>Обработка аутентификации...</p>
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
    padding: '20px'
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '16px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
    maxWidth: '400px',
    width: '90%'
  },
  logo: {
    fontSize: '48px',
    marginBottom: '20px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    margin: '20px auto',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  text: {
    color: '#666',
    marginTop: '10px'
  }
};

if (!document.querySelector('#login-spinner-style')) {
  const style = document.createElement('style');
  style.id = 'login-spinner-style';
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default Login;
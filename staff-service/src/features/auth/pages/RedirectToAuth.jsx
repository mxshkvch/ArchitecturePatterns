import React, { useEffect } from 'react';

export const RedirectToAuth = () => {
  useEffect(() => {
    const authUrl = 'http://localhost:5175/login';
    console.log('🔄 Redirecting to auth service:', authUrl);
    window.location.href = authUrl;
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🏦</div>
        <div className="spinner" style={styles.spinner}></div>
        <p style={styles.text}>Перенаправление на страницу входа...</p>
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

if (!document.querySelector('#redirect-styles')) {
  const style = document.createElement('style');
  style.id = 'redirect-styles';
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default RedirectToAuth;
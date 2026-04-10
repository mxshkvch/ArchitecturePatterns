import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../../services/api';
import { Spinner } from '../../../shared/ui/Spinner';

export const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        authService.logout();
        
        setTimeout(() => {
          window.location.href = 'http://localhost:5175/login';
        }, 1500);
      } catch (error) {
        console.error('Error during logout:', error);
        navigate('/login');
      }
    };

    performLogout();
  }, [navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>👋 До свидания!</h2>
        <Spinner size={40} text="Выход из системы..." />
        <p style={styles.message}>
          Вы будете перенаправлены на страницу входа...
        </p>
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
  title: {
    margin: '0 0 20px 0',
    fontSize: '24px',
    color: '#333'
  },
  message: {
    marginTop: '20px',
    color: '#666',
    fontSize: '14px'
  }
};
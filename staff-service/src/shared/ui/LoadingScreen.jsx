import React from 'react';
import { Spinner } from './Spinner';

export const LoadingScreen = ({ message = 'Загрузка приложения...' }) => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.logo}>🏦</div>
        <Spinner size={48} text={message} />
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
  }
};
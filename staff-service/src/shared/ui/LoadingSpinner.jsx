import React from 'react';
import { useTheme } from '../../ThemeContext';

export const LoadingSpinner = ({ text = 'Загрузка...', size = 50, fullScreen = false }) => {
  const { isDarkMode } = useTheme();

  const spinnerStyle = {
    width: size,
    height: size,
    border: `${size / 10}px solid var(--border-color)`,
    borderTop: `${size / 10}px solid var(--primary-color)`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  const containerStyle = fullScreen ? styles.fullScreenContainer : styles.container;

  return (
    <div style={{
      ...containerStyle,
      backgroundColor: fullScreen ? 'var(--bg-primary)' : 'var(--card-bg)',
      boxShadow: fullScreen ? 'none' : 'var(--shadow)'
    }}>
      <div style={spinnerStyle}></div>
      {text && (
        <p style={{
          ...styles.text,
          color: 'var(--text-secondary)'
        }}>
          {text}
        </p>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    borderRadius: '12px',
    padding: '40px',
    transition: 'all 0.3s ease'
  },
  fullScreenContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    padding: '40px',
    transition: 'all 0.3s ease'
  },
  text: {
    fontSize: '1.1em',
    marginTop: '20px',
    marginBottom: 0,
    transition: 'color 0.3s ease'
  }
};

if (!document.querySelector('#spinner-styles')) {
  const style = document.createElement('style');
  style.id = 'spinner-styles';
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default LoadingSpinner;
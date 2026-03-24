import React from 'react';
import { useTheme } from '../../ThemeContext';

export const ErrorMessage = ({ error, onRetry }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div style={{
      ...styles.errorContainer,
      backgroundColor: 'var(--card-bg)',
      boxShadow: 'var(--shadow)'
    }}>
      <p style={{
        ...styles.errorText,
        color: 'var(--error-color)'
      }}>{error}</p>
      <button 
        onClick={onRetry} 
        style={styles.retryButton}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
      >
        Попробовать снова
      </button>
    </div>
  );
};

const styles = {
  errorContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    borderRadius: '12px',
    transition: 'all 0.3s ease'
  },
  errorText: {
    fontSize: '1.2em',
    marginBottom: '20px',
    transition: 'color 0.3s ease'
  },
  retryButton: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  }
};
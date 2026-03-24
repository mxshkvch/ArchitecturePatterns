// shared/ui/EmptyState.jsx
import React from 'react';

export const EmptyState = ({ 
  message = "Нет данных", 
  icon = "📭",
  onAction,
  actionText 
}) => {
  return (
    <div style={styles.container}>
      <div style={styles.icon}>{icon}</div>
      <p style={styles.message}>{message}</p>
      {onAction && actionText && (
        <button onClick={onAction} style={styles.actionButton}>
          {actionText}
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '60px 20px',
    borderRadius: '16px',
    backgroundColor: 'var(--card-bg)',
    transition: 'all 0.3s ease'
  },
  icon: {
    fontSize: '4em',
    marginBottom: '20px'
  },
  message: {
    fontSize: '1.1em',
    color: 'var(--text-secondary)',
    margin: 0
  },
  actionButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: 'var(--primary-hover)'
    }
  }
};
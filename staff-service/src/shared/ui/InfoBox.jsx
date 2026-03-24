import React from 'react';

export const InfoBox = ({ type = 'info', children, icon = 'ℹ️' }) => {
  const getStyles = () => {
    switch (type) {
      case 'warning':
        return {
          backgroundColor: '#fef3c7',
          borderLeftColor: '#f59e0b',
          color: '#92400e'
        };
      case 'success':
        return {
          backgroundColor: '#d1fae5',
          borderLeftColor: '#10b981',
          color: '#065f46'
        };
      case 'error':
        return {
          backgroundColor: '#fee2e2',
          borderLeftColor: '#ef4444',
          color: '#991b1b'
        };
      default:
        return {
          backgroundColor: '#eff6ff',
          borderLeftColor: '#3b82f6',
          color: '#1e40af'
        };
    }
  };

  const style = getStyles();

  return (
    <div style={{
      ...styles.container,
      backgroundColor: style.backgroundColor,
      borderLeftColor: style.borderLeftColor
    }}>
      <span style={styles.icon}>{icon}</span>
      <p style={{
        ...styles.text,
        color: style.color
      }}>
        {children}
      </p>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '15px 20px',
    borderRadius: '8px',
    borderLeft: '4px solid'
  },
  icon: {
    fontSize: '1.2em',
    flexShrink: 0
  },
  text: {
    margin: 0,
    fontSize: '0.9em',
    lineHeight: '1.5'
  }
};
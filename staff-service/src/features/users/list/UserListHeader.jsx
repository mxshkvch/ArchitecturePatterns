// features/users/list/UserListHeader.jsx
import React from 'react';
import { useTheme } from '../../../ThemeContext';

export const UserListHeader = ({ 
  totalElements, 
  onCreateUser, 
  onCreateTariff,
  onNavigateToCredits 
}) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div style={{
      ...styles.header,
      backgroundColor: 'var(--card-bg)',
      boxShadow: 'var(--shadow)'
    }}>
      <div style={styles.headerLeft}>
        <h1 style={{
          ...styles.title,
          color: 'var(--text-color)'
        }}>Управление пользователями</h1>
        <button 
          onClick={onNavigateToCredits} 
          style={styles.creditsButton}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#3b82f6';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#f8fafc';
            e.target.style.color = '#3b82f6';
          }}
        >
          💳 Список кредитов
        </button>
      </div>
      <div style={styles.headerRight}>
        <button 
          onClick={onCreateUser}  
          style={styles.createUserButton}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
        >
          👤 Создать пользователя
        </button>
        <button 
          onClick={onCreateTariff} 
          style={styles.createRateButton}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#7c3aed'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#8b5cf6'}
        >
          ➕ Создать ставку
        </button>
        <div style={{
          ...styles.stats,
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-secondary)'
        }}>
          Всего пользователей: <strong style={{ color: 'var(--text-color)' }}>{totalElements}</strong>
        </div>
      </div>
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '20px',
    borderRadius: '12px',
    transition: 'all 0.3s ease'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  title: {
    margin: 0,
    fontSize: '2em',
    fontWeight: '600',
    transition: 'color 0.3s ease'
  },
  creditsButton: {
    padding: '8px 16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#3b82f6',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'all 0.2s'
  },
  createUserButton: {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'background-color 0.2s'
  },
  createRateButton: {
    padding: '8px 16px',
    backgroundColor: '#8b5cf6',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'background-color 0.2s'
  },
  stats: {
    fontSize: '1.1em',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  }
};
// features/accounts/ui/AccountsHeader.jsx
import React from 'react';
import { useTheme } from '../../../ThemeContext';

export const AccountsHeader = ({ totalElements }) => {
  const { isDarkMode } = useTheme();

  return (
    <div style={{
      ...styles.header,
      backgroundColor: 'var(--card-bg)',
      boxShadow: 'var(--shadow)'
    }}>
      <h1 style={{
        ...styles.title,
        color: 'var(--text-color)'
      }}>
        Счета пользователя
      </h1>
      <div style={{
        ...styles.totalAccounts,
        backgroundColor: 'var(--bg-secondary)',
        color: 'var(--text-secondary)'
      }}>
        Всего счетов: <strong style={{ color: 'var(--text-color)' }}>{totalElements}</strong>
      </div>
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    padding: '20px',
    borderRadius: '16px',
    transition: 'all 0.3s ease'
  },
  title: {
    margin: 0,
    fontSize: '1.8em',
    fontWeight: '600',
    transition: 'color 0.3s ease'
  },
  totalAccounts: {
    fontSize: '1.1em',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  }
};
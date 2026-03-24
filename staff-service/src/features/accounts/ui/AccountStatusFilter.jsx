// features/accounts/ui/AccountStatusFilter.jsx
import React from 'react';
import { useTheme } from '../../../ThemeContext';

const STATUSES = [
  { value: '', label: 'Все', color: 'default' },
  { value: 'ACTIVE', label: 'Активные', color: '#2ecc71' },
  { value: 'BLOCKED', label: 'Заблокированные', color: '#e74c3c' },
  { value: 'CLOSED', label: 'Закрытые', color: '#95a5a6' },
];

export const AccountStatusFilter = ({ selectedStatus, onStatusChange }) => {
  const { isDarkMode } = useTheme();

  return (
    <div style={{
      ...styles.container,
      backgroundColor: 'var(--card-bg)',
      boxShadow: 'var(--shadow)'
    }}>
      <span style={{
        ...styles.label,
        color: 'var(--text-secondary)'
      }}>
        Статус счета:
      </span>
      <div style={styles.buttonGroup}>
        {STATUSES.map((status) => (
          <button
            key={status.value}
            onClick={() => onStatusChange(status.value)}
            style={{
              ...styles.filterButton,
              backgroundColor: selectedStatus === status.value 
                ? 'var(--primary-color)' 
                : 'var(--button-bg)',
              borderColor: 'var(--border-color)',
              color: selectedStatus === status.value 
                ? 'white' 
                : 'var(--text-secondary)',
            }}
            onMouseEnter={(e) => {
              if (selectedStatus !== status.value) {
                e.target.style.backgroundColor = 'var(--button-hover-bg)';
                e.target.style.borderColor = 'var(--primary-color)';
                e.target.style.color = 'var(--primary-color)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedStatus !== status.value) {
                e.target.style.backgroundColor = 'var(--button-bg)';
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.color = 'var(--text-secondary)';
              }
            }}
          >
            {status.label}
          </button>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '25px',
    padding: '15px 20px',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    flexWrap: 'wrap'
  },
  label: {
    fontSize: '0.95em',
    fontWeight: '500',
    transition: 'color 0.3s ease'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  filterButton: {
    padding: '8px 16px',
    border: '1px solid',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'all 0.2s',
  }
};
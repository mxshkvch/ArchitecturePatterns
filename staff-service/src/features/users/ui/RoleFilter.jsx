// features/users/ui/RoleFilter.jsx
import React from 'react';
import { useTheme } from '../../../ThemeContext';

export const RoleFilter = ({ selectedRole, onRoleChange, getRoleLabel }) => {
  const { isDarkMode } = useTheme();
  const roles = ['', 'CLIENT', 'EMPLOYEE', 'ADMIN'];

  return (
    <div style={{
      ...styles.filterContainer,
      backgroundColor: 'var(--card-bg)',
      boxShadow: 'var(--shadow)'
    }}>
      <span style={{
        ...styles.filterLabel,
        color: 'var(--text-secondary)'
      }}>
        Фильтр по роли:
      </span>
      <div style={styles.buttonGroup}>
        {roles.map((role) => {
          const isActive = selectedRole === role;
          return (
            <button
              key={role || 'all'}
              onClick={() => onRoleChange(role)}
              style={{
                ...styles.filterButton,
                backgroundColor: isActive ? 'var(--primary-color)' : 'var(--button-bg)',
                borderColor: 'var(--border-color)',
                color: isActive ? 'white' : 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = 'var(--button-hover-bg)';
                  e.target.style.borderColor = 'var(--primary-color)';
                  e.target.style.color = 'var(--primary-color)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.target.style.backgroundColor = 'var(--button-bg)';
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.color = 'var(--text-secondary)';
                }
              }}
            >
              {role ? getRoleLabel(role) : 'Все'}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px',
    padding: '15px 20px',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    flexWrap: 'wrap'
  },
  filterLabel: {
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
    fontWeight: '500'
  }
};
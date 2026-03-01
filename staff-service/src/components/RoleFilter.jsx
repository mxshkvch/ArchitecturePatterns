import React from 'react';

const RoleFilter = ({ selectedRole, onRoleChange, getRoleLabel }) => {
  const roles = ['', 'CLIENT', 'EMPLOYEE', 'ADMIN'];

  return (
    <div style={styles.filterContainer}>
      <span style={styles.filterLabel}>Фильтр по роли:</span>
      <div style={styles.buttonGroup}>
        {roles.map((role) => (
          <button
            key={role || 'all'}
            onClick={() => onRoleChange(role)}
            style={{
              ...styles.filterButton,
              ...(selectedRole === role ? styles.filterButtonActive : {})
            }}
          >
            {role ? getRoleLabel(role) : 'Все'}
          </button>
        ))}
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
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  filterLabel: {
    color: '#64748b',
    fontSize: '0.95em',
    fontWeight: '500'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px'
  },
  filterButton: {
    padding: '8px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f8fafc',
      borderColor: '#3b82f6'
    }
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6'
  }
};

export default RoleFilter;
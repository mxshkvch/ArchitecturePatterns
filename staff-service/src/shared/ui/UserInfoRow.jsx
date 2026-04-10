import React from 'react';

export const UserInfoRow = ({ label, value, icon }) => {
  if (!value) return null;
  
  return (
    <div style={styles.row}>
      <span style={styles.label}>
        {icon && <span style={styles.icon}>{icon}</span>}
        {label}:
      </span>
      <span style={styles.value}>{value}</span>
    </div>
  );
};

const styles = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  label: {
    minWidth: '80px',
    color: '#64748b',
    fontSize: '0.9em'
  },
  icon: {
    marginRight: '4px'
  },
  value: {
    color: '#1e293b',
    fontSize: '0.95em'
  }
};
import React from 'react';
import { formatDateTime, getStatusColor, getStatusText } from '../../../shared/utils/formatters';

export const AccountDetailsGrid = ({ account }) => {
  const statusColor = getStatusColor(account.status);
  const statusText = getStatusText(account.status);

  const details = [
    { label: 'ID счета', value: account.id },
    { label: 'Номер счета', value: account.accountNumber },
    { label: 'Валюта', value: account.currency || 'RUB' },
    { label: 'Статус', value: statusText, isBadge: true, badgeColor: statusColor },
    { label: 'Создан', value: formatDateTime(account.createdAt) },
  ];

  if (account.closedAt) {
    details.push({ label: 'Закрыт', value: formatDateTime(account.closedAt) });
  }

  return (
    <div style={styles.grid}>
      {details.map((detail, index) => (
        <div key={index} style={styles.item}>
          <span style={styles.label}>{detail.label}:</span>
          {detail.isBadge ? (
            <span style={{
              ...styles.badge,
              backgroundColor: `${detail.badgeColor}20`,
              color: detail.badgeColor
            }}>
              {detail.value}
            </span>
          ) : (
            <span style={styles.value}>{detail.value}</span>
          )}
        </div>
      ))}
    </div>
  );
};

const styles = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '12px'
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 0'
  },
  label: {
    minWidth: '100px',
    color: 'var(--text-secondary)',
    fontSize: '0.9em',
    fontWeight: '500'
  },
  value: {
    color: 'var(--text-color)',
    fontSize: '0.95em',
    wordBreak: 'break-all'
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.85em',
    fontWeight: '500',
    display: 'inline-block'
  }
};
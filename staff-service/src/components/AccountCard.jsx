import React from 'react';

const AccountCard = ({ account, formatDate, formatCurrency, getStatusColor }) => {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.accountIcon}>💰</div>
        <div style={styles.accountInfo}>
          <h3 style={styles.accountNumber}>
            Счет #{account.accountNumber}
          </h3>
          <p style={styles.accountId}>ID: {account.id}</p>
        </div>
      </div>

      <div style={styles.cardBody}>
        <div style={styles.balanceSection}>
          <span style={styles.balanceLabel}>Баланс</span>
          <span style={styles.balanceValue}>
            {formatCurrency(account.balance, account.currency)}
          </span>
        </div>

        <div style={styles.detailsGrid}>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Валюта</span>
            <span style={styles.detailValue}>{account.currency}</span>
          </div>

          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Статус</span>
            <span style={{
              ...styles.statusBadge,
              backgroundColor: getStatusColor(account.status) + '20',
              color: getStatusColor(account.status)
            }}>
              {account.status === 'ACTIVE' ? 'Активен' :
               account.status === 'BLOCKED' ? 'Заблокирован' : 'Закрыт'}
            </span>
          </div>

          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Создан</span>
            <span style={styles.detailValue}>{formatDate(account.createdAt)}</span>
          </div>

          {account.closedAt && (
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Закрыт</span>
              <span style={styles.detailValue}>{formatDate(account.closedAt)}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s',
    ':hover': {
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
      transform: 'translateY(-2px)'
    }
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e2e8f0'
  },
  accountIcon: {
    fontSize: '2em'
  },
  accountInfo: {
    flex: 1
  },
  accountNumber: {
    margin: '0 0 5px 0',
    color: '#1e293b',
    fontSize: '1.1em',
    fontWeight: '600',
    wordBreak: 'break-all'
  },
  accountId: {
    margin: 0,
    color: '#64748b',
    fontSize: '0.85em',
    wordBreak: 'break-all'
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  balanceSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: 'white',
    borderRadius: '8px'
  },
  balanceLabel: {
    color: '#64748b',
    fontSize: '0.9em'
  },
  balanceValue: {
    color: '#1e293b',
    fontSize: '1.3em',
    fontWeight: '600'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px'
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  detailLabel: {
    color: '#64748b',
    fontSize: '0.8em',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  detailValue: {
    color: '#1e293b',
    fontSize: '0.95em'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.85em',
    fontWeight: '500',
    textAlign: 'center'
  }
};

export default AccountCard;
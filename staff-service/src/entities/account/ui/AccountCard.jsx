import React from 'react';
import { useTheme } from '../../../ThemeContext';
import { formatDate, formatCurrency, getStatusColor, getStatusText } from '../../../shared/utils/formatters';

export const AccountCard = ({ account, formatDate, formatCurrency, getStatusColor, userId, onViewTransactions }) => {
  const { isDarkMode } = useTheme();

  const handleViewTransactions = () => {
    if (onViewTransactions) {
      onViewTransactions(account.id);
    }
  };

  const getStatusColorStyle = () => {
    const color = getStatusColor(account.status);
    return {
      backgroundColor: `${color}20`,
      color: color
    };
  };

  const getStatusTextRu = () => {
    return getStatusText(account.status);
  };

  return (
    <div 
      style={{
        ...styles.card,
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)',
        cursor: 'pointer'
      }}
      onClick={handleViewTransactions}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.borderColor = 'var(--primary-color)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
    >
      <div style={{
        ...styles.cardHeader,
        borderBottomColor: 'var(--border-color)'
      }}>
        <div style={styles.accountIcon}>💰</div>
        <div style={styles.accountInfo}>
          <h3 style={{
            ...styles.accountNumber,
            color: 'var(--text-color)'
          }}>
            Счет #{account.accountNumber}
          </h3>
          <p style={{
            ...styles.accountId,
            color: 'var(--text-secondary)'
          }}>
            ID: {account.id}
          </p>
        </div>
      </div>

      <div style={styles.cardBody}>
        <div style={{
          ...styles.balanceSection,
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <span style={{
            ...styles.balanceLabel,
            color: 'var(--text-secondary)'
          }}>
            Баланс
          </span>
          <span style={{
            ...styles.balanceValue,
            color: 'var(--text-color)'
          }}>
            {formatCurrency(account.balance, account.currency)}
          </span>
        </div>

        <div style={styles.detailsGrid}>
          <div style={styles.detailItem}>
            <span style={{
              ...styles.detailLabel,
              color: 'var(--text-secondary)'
            }}>
              Валюта
            </span>
            <span style={{
              ...styles.detailValue,
              color: 'var(--text-color)'
            }}>
              {account.currency}
            </span>
          </div>

          <div style={styles.detailItem}>
            <span style={{
              ...styles.detailLabel,
              color: 'var(--text-secondary)'
            }}>
              Статус
            </span>
            <span style={{
              ...styles.statusBadge,
              ...getStatusColorStyle()
            }}>
              {getStatusTextRu()}
            </span>
          </div>

          <div style={styles.detailItem}>
            <span style={{
              ...styles.detailLabel,
              color: 'var(--text-secondary)'
            }}>
              Создан
            </span>
            <span style={{
              ...styles.detailValue,
              color: 'var(--text-color)'
            }}>
              {formatDate(account.createdAt)}
            </span>
          </div>

          {account.closedAt && (
            <div style={styles.detailItem}>
              <span style={{
                ...styles.detailLabel,
                color: 'var(--text-secondary)'
              }}>
                Закрыт
              </span>
              <span style={{
                ...styles.detailValue,
                color: 'var(--text-color)'
              }}>
                {formatDate(account.closedAt)}
              </span>
            </div>
          )}
        </div>

        <button 
          onClick={handleViewTransactions}
          style={styles.transactionsButton}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#2563eb'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#3b82f6'}
        >
          История операций
        </button>
      </div>
    </div>
  );
};

const styles = {
  card: {
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid',
    transition: 'all 0.2s',
    boxShadow: 'var(--shadow-sm)'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid'
  },
  accountIcon: {
    fontSize: '2em'
  },
  accountInfo: {
    flex: 1
  },
  accountNumber: {
    margin: '0 0 5px 0',
    fontSize: '1.1em',
    fontWeight: '600',
    wordBreak: 'break-all'
  },
  accountId: {
    margin: 0,
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
    padding: '12px 15px',
    borderRadius: '8px'
  },
  balanceLabel: {
    fontSize: '0.9em',
    fontWeight: '500'
  },
  balanceValue: {
    fontSize: '1.3em',
    fontWeight: '600'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px'
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  detailLabel: {
    fontSize: '0.75em',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  detailValue: {
    fontSize: '0.9em',
    fontWeight: '500'
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.85em',
    fontWeight: '500',
    textAlign: 'center',
    width: 'fit-content'
  },
  transactionsButton: {
    padding: '8px 16px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9em',
    marginTop: '10px',
    width: '100%',
    transition: 'background-color 0.2s'
  }
};

export default AccountCard;
import React from 'react';
import { useTheme } from '../../../ThemeContext';
import { 
  getTransactionTypeLabel, 
  getTransactionTypeColor, 
  getTransactionIcon,
  getTransactionAmountColor,
  formatTransactionId
} from '../../../shared/utils/transactionUtils';
import { formatDateTime, formatCurrency } from '../../../shared/utils/formatters';

export const TransactionCard = ({ transaction, onClick }) => {
  const { isDarkMode } = useTheme();
  
  const typeColor = getTransactionTypeColor(transaction.type);
  const amountColor = getTransactionAmountColor(transaction.type);
  const icon = getTransactionIcon(transaction.type);
  const typeLabel = getTransactionTypeLabel(transaction.type);
  const isPositive = transaction.type === 'DEPOSIT' || 
                     transaction.type === 'REFUND' || 
                     transaction.type === 'INTEREST';
  const sign = isPositive ? '+' : '-';

  const handleClick = () => {
    if (onClick) {
      onClick(transaction);
    }
  };

  return (
    <div 
      style={{
        ...styles.card,
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = 'var(--primary-color)';
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        }
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
        <div style={styles.typeSection}>
          <div style={styles.iconWrapper}>
            {icon}
          </div>
          <span style={{
            ...styles.typeBadge,
            backgroundColor: `${typeColor}20`,
            color: typeColor
          }}>
            {typeLabel}
          </span>
          <span style={{
            ...styles.transactionId,
            color: 'var(--text-secondary)'
          }}>
            ID: {formatTransactionId(transaction.id)}
          </span>
        </div>
        <span style={{
          ...styles.timestamp,
          color: 'var(--text-tertiary)'
        }}>
          {formatDateTime(transaction.timestamp)}
        </span>
      </div>

      <div style={styles.cardBody}>
        <div style={{
          ...styles.amountSection,
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <span style={{
            ...styles.amountLabel,
            color: 'var(--text-secondary)'
          }}>
            Сумма
          </span>
          <span style={{
            ...styles.amountValue,
            color: amountColor
          }}>
            {sign} {formatCurrency(transaction.amount)}
          </span>
        </div>

        <div style={styles.detailsGrid}>
          <div style={styles.detailItem}>
            <span style={{
              ...styles.detailLabel,
              color: 'var(--text-secondary)'
            }}>
              Баланс после
            </span>
            <span style={{
              ...styles.detailValue,
              color: 'var(--text-color)'
            }}>
              {formatCurrency(transaction.balanceAfter)}
            </span>
          </div>

          {transaction.balanceBefore !== undefined && (
            <div style={styles.detailItem}>
              <span style={{
                ...styles.detailLabel,
                color: 'var(--text-secondary)'
              }}>
                Баланс до
              </span>
              <span style={{
                ...styles.detailValue,
                color: 'var(--text-color)'
              }}>
                {formatCurrency(transaction.balanceBefore)}
              </span>
            </div>
          )}

          {transaction.description && (
            <div style={{
              ...styles.descriptionItem,
              borderTopColor: 'var(--border-color)'
            }}>
              <span style={{
                ...styles.detailLabel,
                color: 'var(--text-secondary)'
              }}>
                Описание
              </span>
              <div style={{
                ...styles.descriptionValue,
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-color)'
              }}>
                {transaction.description}
              </div>
            </div>
          )}

          {transaction.reference && (
            <div style={styles.detailItem}>
              <span style={{
                ...styles.detailLabel,
                color: 'var(--text-secondary)'
              }}>
                Ссылка
              </span>
              <span style={{
                ...styles.detailValue,
                color: 'var(--text-color)',
                fontSize: '0.85em'
              }}>
                {transaction.reference}
              </span>
            </div>
          )}
        </div>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid'
  },
  typeSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap'
  },
  iconWrapper: {
    fontSize: '1.2em'
  },
  typeBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.85em',
    fontWeight: '500'
  },
  transactionId: {
    fontSize: '0.8em'
  },
  timestamp: {
    fontSize: '0.85em'
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  amountSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 15px',
    borderRadius: '8px'
  },
  amountLabel: {
    fontSize: '0.9em',
    fontWeight: '500'
  },
  amountValue: {
    fontSize: '1.3em',
    fontWeight: '600'
  },
  detailsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  detailLabel: {
    fontSize: '0.85em'
  },
  detailValue: {
    fontSize: '0.95em',
    fontWeight: '500'
  },
  descriptionItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '5px',
    paddingTop: '10px',
    borderTop: '1px dashed'
  },
  descriptionValue: {
    fontSize: '0.9em',
    lineHeight: '1.5',
    padding: '10px',
    borderRadius: '6px'
  }
};

export default TransactionCard;
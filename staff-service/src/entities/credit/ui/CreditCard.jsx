import React from 'react';
import { useTheme } from '../../../ThemeContext';
import { 
  getCreditStatusColor, 
  getCreditStatusLabel, 
  getCreditStatusIcon,
  formatCreditId,
  calculateProgress
} from '../../../shared/utils/creditUtils';
import { formatDate, formatCurrency } from '../../../shared/utils/formatters';

export const CreditCard = ({ credit, onClick }) => {
  const { isDarkMode } = useTheme();
  
  const statusColor = getCreditStatusColor(credit.status);
  const statusLabel = getCreditStatusLabel(credit.status);
  const statusIcon = getCreditStatusIcon(credit.status);
  const progress = calculateProgress(credit.principal, credit.remainingAmount);
  
  const handleClick = () => {
    if (onClick) {
      onClick(credit);
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
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.borderColor = 'var(--primary-color)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--border-color)';
      }}
    >
      <div style={{
        ...styles.cardHeader,
        borderBottomColor: 'var(--border-color)'
      }}>
        <div style={styles.creditIcon}>💳</div>
        <div style={styles.creditInfo}>
          <h3 style={{
            ...styles.creditId,
            color: 'var(--text-color)'
          }}>
            Кредит #{formatCreditId(credit.id)}
          </h3>
          <p style={{
            ...styles.userId,
            color: 'var(--text-secondary)'
          }}>
            ID пользователя: {formatCreditId(credit.userId)}
          </p>
        </div>
        <div style={styles.statusContainer}>
          <span style={{
            ...styles.statusBadge,
            backgroundColor: `${statusColor}20`,
            color: statusColor
          }}>
            {statusIcon} {statusLabel}
          </span>
        </div>
      </div>

      <div style={styles.cardBody}>
        <div style={{
          ...styles.amountsSection,
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <div style={styles.amountItem}>
            <span style={{
              ...styles.amountLabel,
              color: 'var(--text-secondary)'
            }}>
              Сумма кредита
            </span>
            <span style={{
              ...styles.amountValue,
              color: 'var(--text-color)'
            }}>
              {formatCurrency(credit.principal)}
            </span>
          </div>
          <div style={styles.amountItem}>
            <span style={{
              ...styles.amountLabel,
              color: 'var(--text-secondary)'
            }}>
              Остаток
            </span>
            <span style={{
              ...styles.amountValue,
              color: credit.remainingAmount > 0 ? 'var(--error-color)' : 'var(--success-color)'
            }}>
              {formatCurrency(credit.remainingAmount)}
            </span>
          </div>
        </div>

        {/* Прогресс оплаты */}
        <div style={styles.progressSection}>
          <div style={styles.progressHeader}>
            <span style={{
              ...styles.progressLabel,
              color: 'var(--text-secondary)'
            }}>
              Прогресс оплаты
            </span>
            <span style={{
              ...styles.progressValue,
              color: 'var(--text-color)'
            }}>
              {progress}%
            </span>
          </div>
          <div style={{
            ...styles.progressBar,
            backgroundColor: 'var(--bg-secondary)'
          }}>
            <div
              style={{
                ...styles.progressFill,
                width: `${progress}%`,
                backgroundColor: progress >= 100 ? 'var(--success-color)' : 'var(--primary-color)'
              }}
            />
          </div>
        </div>

        <div style={{
          ...styles.rateSection,
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <span style={{
            ...styles.rateLabel,
            color: 'var(--text-secondary)'
          }}>
            Процентная ставка
          </span>
          <span style={{
            ...styles.rateValue,
            color: 'var(--primary-color)'
          }}>
            {credit.interestRate}%
          </span>
        </div>

        <div style={styles.datesGrid}>
          <div style={styles.dateItem}>
            <span style={{
              ...styles.dateLabel,
              color: 'var(--text-secondary)'
            }}>
              Начало
            </span>
            <span style={{
              ...styles.dateValue,
              color: 'var(--text-color)'
            }}>
              {formatDate(credit.startDate)}
            </span>
          </div>
          <div style={styles.dateItem}>
            <span style={{
              ...styles.dateLabel,
              color: 'var(--text-secondary)'
            }}>
              Окончание
            </span>
            <span style={{
              ...styles.dateValue,
              color: 'var(--text-color)'
            }}>
              {formatDate(credit.endDate)}
            </span>
          </div>
        </div>

        <div style={{
          ...styles.idsSection,
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <p style={{
            ...styles.idText,
            color: 'var(--text-secondary)'
          }}>
            Счет: {formatCreditId(credit.accountId, 12)}
          </p>
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
    alignItems: 'center',
    gap: '15px',
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid'
  },
  creditIcon: {
    fontSize: '2em'
  },
  creditInfo: {
    flex: 1
  },
  creditId: {
    margin: '0 0 5px 0',
    fontSize: '1.1em',
    fontWeight: '600'
  },
  userId: {
    margin: 0,
    fontSize: '0.85em'
  },
  statusContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.85em',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  amountsSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    padding: '12px',
    borderRadius: '8px'
  },
  amountItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  amountLabel: {
    fontSize: '0.8em',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  amountValue: {
    fontSize: '1.2em',
    fontWeight: '600'
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85em'
  },
  progressLabel: {
    fontWeight: '500'
  },
  progressValue: {
    fontWeight: '600'
  },
  progressBar: {
    height: '8px',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  },
  rateSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderRadius: '8px'
  },
  rateLabel: {
    fontSize: '0.9em'
  },
  rateValue: {
    fontSize: '1.2em',
    fontWeight: '600'
  },
  datesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px'
  },
  dateItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  dateLabel: {
    fontSize: '0.8em',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  dateValue: {
    fontSize: '0.9em'
  },
  idsSection: {
    marginTop: '5px',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '0.8em',
    wordBreak: 'break-all'
  },
  idText: {
    margin: 0
  }
};
// features/credits/ui/CreditDetailsModal.jsx
import React from 'react';
import { formatDate, formatCurrency } from '../../../shared/utils/formatters';
import { 
  getCreditStatusColor, 
  getCreditStatusLabel,
  getCreditStatusIcon,
  formatCreditId,
  calculateProgress
} from '../../../shared/utils/creditUtils';

export const CreditDetailsModal = ({ credit, isOpen, onClose }) => {
  if (!isOpen || !credit) return null;

  const statusColor = getCreditStatusColor(credit.status);
  const statusLabel = getCreditStatusLabel(credit.status);
  const statusIcon = getCreditStatusIcon(credit.status);
  const progress = calculateProgress(credit.principal, credit.remainingAmount);
  const paidAmount = credit.principal - credit.remainingAmount;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Детали кредита</h2>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>

        <div style={styles.content}>
          {/* Статус */}
          <div style={styles.statusSection}>
            <span style={{
              ...styles.statusBadge,
              backgroundColor: `${statusColor}20`,
              color: statusColor
            }}>
              {statusIcon} {statusLabel}
            </span>
          </div>

          {/* Основная информация */}
          <div style={styles.infoSection}>
            <div style={styles.infoRow}>
              <span style={styles.label}>ID кредита:</span>
              <span style={styles.value}>{credit.id}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>ID пользователя:</span>
              <span style={styles.value}>{credit.userId}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.label}>Счет:</span>
              <span style={styles.value}>{formatCreditId(credit.accountId, 12)}</span>
            </div>
          </div>

          {/* Финансовая информация */}
          <div style={styles.financialSection}>
            <div style={styles.financialItem}>
              <span style={styles.financialLabel}>Сумма кредита</span>
              <span style={styles.financialValue}>
                {formatCurrency(credit.principal)}
              </span>
            </div>
            <div style={styles.financialItem}>
              <span style={styles.financialLabel}>Остаток долга</span>
              <span style={{
                ...styles.financialValue,
                color: credit.remainingAmount > 0 ? '#e74c3c' : '#2ecc71'
              }}>
                {formatCurrency(credit.remainingAmount)}
              </span>
            </div>
            <div style={styles.financialItem}>
              <span style={styles.financialLabel}>Оплачено</span>
              <span style={styles.financialValue}>
                {formatCurrency(paidAmount)}
              </span>
            </div>
            <div style={styles.financialItem}>
              <span style={styles.financialLabel}>Процентная ставка</span>
              <span style={styles.financialValue}>
                {credit.interestRate}%
              </span>
            </div>
          </div>

          {/* Прогресс */}
          <div style={styles.progressSection}>
            <div style={styles.progressHeader}>
              <span style={styles.progressLabel}>Прогресс оплаты</span>
              <span style={styles.progressValue}>{progress}%</span>
            </div>
            <div style={styles.progressBar}>
              <div
                style={{
                  ...styles.progressFill,
                  width: `${progress}%`,
                  backgroundColor: progress >= 100 ? '#2ecc71' : '#3b82f6'
                }}
              />
            </div>
          </div>

          {/* Даты */}
          <div style={styles.datesSection}>
            <div style={styles.dateItem}>
              <span style={styles.dateLabel}>Дата начала</span>
              <span style={styles.dateValue}>{formatDate(credit.startDate)}</span>
            </div>
            <div style={styles.dateItem}>
              <span style={styles.dateLabel}>Дата окончания</span>
              <span style={styles.dateValue}>{formatDate(credit.endDate)}</span>
            </div>
            {credit.closedAt && (
              <div style={styles.dateItem}>
                <span style={styles.dateLabel}>Дата закрытия</span>
                <span style={styles.dateValue}>{formatDate(credit.closedAt)}</span>
              </div>
            )}
          </div>

          {/* Дополнительная информация */}
          {credit.description && (
            <div style={styles.descriptionSection}>
              <span style={styles.descriptionLabel}>Описание:</span>
              <p style={styles.description}>{credit.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '85vh',
    overflow: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e2e8f0'
  },
  title: {
    margin: 0,
    fontSize: '1.3em',
    fontWeight: '600',
    color: '#1e293b'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#64748b',
    padding: '0 8px',
    transition: 'color 0.2s',
    ':hover': {
      color: '#e74c3c'
    }
  },
  content: {
    padding: '20px'
  },
  statusSection: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px'
  },
  statusBadge: {
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '0.9em',
    fontWeight: '500'
  },
  infoSection: {
    backgroundColor: '#f8fafc',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #e2e8f0',
    ':last-child': {
      borderBottom: 'none'
    }
  },
  label: {
    color: '#64748b',
    fontSize: '0.9em',
    fontWeight: '500'
  },
  value: {
    color: '#1e293b',
    fontSize: '0.95em',
    fontFamily: 'monospace'
  },
  financialSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '20px'
  },
  financialItem: {
    backgroundColor: '#f1f5f9',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center'
  },
  financialLabel: {
    display: 'block',
    color: '#64748b',
    fontSize: '0.8em',
    textTransform: 'uppercase',
    marginBottom: '8px'
  },
  financialValue: {
    fontSize: '1.2em',
    fontWeight: '600',
    color: '#1e293b'
  },
  progressSection: {
    marginBottom: '20px'
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  progressLabel: {
    color: '#64748b',
    fontSize: '0.85em'
  },
  progressValue: {
    color: '#1e293b',
    fontWeight: '600'
  },
  progressBar: {
    height: '8px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.3s ease'
  },
  datesSection: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px',
    marginBottom: '20px'
  },
  dateItem: {
    backgroundColor: '#f8fafc',
    padding: '10px',
    borderRadius: '8px'
  },
  dateLabel: {
    display: 'block',
    color: '#64748b',
    fontSize: '0.75em',
    textTransform: 'uppercase',
    marginBottom: '4px'
  },
  dateValue: {
    color: '#1e293b',
    fontSize: '0.9em'
  },
  descriptionSection: {
    backgroundColor: '#f8fafc',
    padding: '12px',
    borderRadius: '8px'
  },
  descriptionLabel: {
    display: 'block',
    color: '#64748b',
    fontSize: '0.8em',
    textTransform: 'uppercase',
    marginBottom: '8px'
  },
  description: {
    margin: 0,
    color: '#1e293b',
    fontSize: '0.95em',
    lineHeight: '1.5'
  }
};
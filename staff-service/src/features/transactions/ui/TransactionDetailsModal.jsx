import React from 'react';
import { formatDateTime, formatCurrency } from '../../../shared/utils/formatters';
import { getTransactionTypeLabel, getTransactionTypeColor, getTransactionIcon } from '../../../shared/utils/transactionUtils';

export const TransactionDetailsModal = ({ transaction, isOpen, onClose }) => {
  if (!isOpen || !transaction) return null;

  const typeColor = getTransactionTypeColor(transaction.type);
  const icon = getTransactionIcon(transaction.type);
  const typeLabel = getTransactionTypeLabel(transaction.type);
  const isPositive = transaction.type === 'DEPOSIT' || 
                     transaction.type === 'REFUND' || 
                     transaction.type === 'INTEREST';
  const sign = isPositive ? '+' : '-';

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Детали операции</h2>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>

        <div style={styles.content}>
          <div style={styles.typeSection}>
            <span style={styles.icon}>{icon}</span>
            <span style={{
              ...styles.typeBadge,
              backgroundColor: `${typeColor}20`,
              color: typeColor
            }}>
              {typeLabel}
            </span>
          </div>

          <div style={styles.infoGrid}>
            <div style={styles.infoRow}>
              <span style={styles.label}>ID операции:</span>
              <span style={styles.value}>{transaction.id}</span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.label}>Дата и время:</span>
              <span style={styles.value}>{formatDateTime(transaction.timestamp)}</span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.label}>Сумма:</span>
              <span style={{
                ...styles.amount,
                color: isPositive ? '#2ecc71' : '#e74c3c'
              }}>
                {sign} {formatCurrency(transaction.amount)}
              </span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.label}>Баланс до:</span>
              <span style={styles.value}>
                {formatCurrency(transaction.balanceBefore || transaction.balanceAfter - transaction.amount)}
              </span>
            </div>

            <div style={styles.infoRow}>
              <span style={styles.label}>Баланс после:</span>
              <span style={styles.value}>{formatCurrency(transaction.balanceAfter)}</span>
            </div>

            {transaction.description && (
              <div style={styles.descriptionSection}>
                <span style={styles.label}>Описание:</span>
                <div style={styles.description}>{transaction.description}</div>
              </div>
            )}

            {transaction.reference && (
              <div style={styles.infoRow}>
                <span style={styles.label}>Ссылка:</span>
                <span style={styles.value}>{transaction.reference}</span>
              </div>
            )}
          </div>
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
    maxWidth: '500px',
    width: '90%',
    maxHeight: '80vh',
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
    fontSize: '1.5em',
    cursor: 'pointer',
    color: '#64748b',
    padding: '0 8px'
  },
  content: {
    padding: '20px'
  },
  typeSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e2e8f0'
  },
  icon: {
    fontSize: '1.5em'
  },
  typeBadge: {
    padding: '6px 14px',
    borderRadius: '20px',
    fontSize: '0.9em',
    fontWeight: '500'
  },
  infoGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  label: {
    color: '#64748b',
    fontSize: '0.9em',
    fontWeight: '500'
  },
  value: {
    color: '#1e293b',
    fontSize: '0.95em'
  },
  amount: {
    fontSize: '1.1em',
    fontWeight: '600'
  },
  descriptionSection: {
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px dashed #e2e8f0'
  },
  description: {
    marginTop: '8px',
    padding: '12px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    color: '#1e293b',
    fontSize: '0.95em',
    lineHeight: '1.5'
  }
};
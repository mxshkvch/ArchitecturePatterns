import React from 'react';

const TransactionCard = ({ 
  transaction, 
  formatDateTime, 
  formatCurrency, 
  getTransactionTypeColor,
  getTransactionTypeLabel 
}) => {
  const isPositive = transaction.balanceAfter > (transaction.balanceAfter - transaction.amount);
  const amountColor = transaction.type === 'DEPOSIT' ? '#2ecc71' : '#e74c3c';

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.typeSection}>
          <span style={{
            ...styles.typeBadge,
            backgroundColor: getTransactionTypeColor(transaction.type) + '20',
            color: getTransactionTypeColor(transaction.type)
          }}>
            {getTransactionTypeLabel(transaction.type)}
          </span>
          <span style={styles.transactionId}>
            ID: {transaction.id.slice(0, 8)}...
          </span>
        </div>
        <span style={styles.timestamp}>
          {formatDateTime(transaction.timestamp)}
        </span>
      </div>

      <div style={styles.cardBody}>
        <div style={styles.amountSection}>
          <span style={styles.amountLabel}>Сумма</span>
          <span style={{
            ...styles.amountValue,
            color: amountColor
          }}>
            {transaction.type === 'DEPOSIT' ? '+' : '-'} {formatCurrency(transaction.amount)}
          </span>
        </div>

        <div style={styles.detailsGrid}>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Баланс после</span>
            <span style={styles.detailValue}>{formatCurrency(transaction.balanceAfter)}</span>
          </div>

          {transaction.description && (
            <div style={styles.descriptionItem}>
              <span style={styles.detailLabel}>Описание</span>
              <span style={styles.descriptionValue}>{transaction.description}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
    transition: 'all 0.2s',
    ':hover': {
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
      transform: 'translateY(-2px)',
      borderColor: '#3b82f6'
    }
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e2e8f0'
  },
  typeSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  typeBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.9em',
    fontWeight: '500'
  },
  transactionId: {
    color: '#64748b',
    fontSize: '0.85em'
  },
  timestamp: {
    color: '#94a3b8',
    fontSize: '0.9em'
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
    padding: '10px 15px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  },
  amountLabel: {
    color: '#64748b',
    fontSize: '0.95em',
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
    color: '#64748b',
    fontSize: '0.9em'
  },
  detailValue: {
    color: '#1e293b',
    fontSize: '1em',
    fontWeight: '500'
  },
  descriptionItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    marginTop: '5px',
    paddingTop: '10px',
    borderTop: '1px dashed #e2e8f0'
  },
  descriptionValue: {
    color: '#1e293b',
    fontSize: '0.95em',
    lineHeight: '1.5',
    backgroundColor: '#f8fafc',
    padding: '10px',
    borderRadius: '6px'
  }
};

export default TransactionCard;
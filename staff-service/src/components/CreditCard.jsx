import React from 'react';

const CreditCard = ({ credit, formatDate, formatCurrency, getStatusColor, getStatusLabel }) => {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div style={styles.creditIcon}>💳</div>
        <div style={styles.creditInfo}>
          <h3 style={styles.creditId}>Кредит #{credit.id.slice(0, 8)}</h3>
          <p style={styles.userId}>ID пользователя: {credit.userid.slice(0, 8)}...</p>
        </div>
        <span style={{
          ...styles.statusBadge,
          backgroundColor: getStatusColor(credit.status) + '20',
          color: getStatusColor(credit.status)
        }}>
          {getStatusLabel(credit.status)}
        </span>
      </div>

      <div style={styles.cardBody}>
        <div style={styles.amountsSection}>
          <div style={styles.amountItem}>
            <span style={styles.amountLabel}>Сумма кредита</span>
            <span style={styles.amountValue}>{formatCurrency(credit.principal)}</span>
          </div>
          <div style={styles.amountItem}>
            <span style={styles.amountLabel}>Остаток</span>
            <span style={styles.amountValue}>{formatCurrency(credit.remainingAmount)}</span>
          </div>
        </div>

        <div style={styles.rateSection}>
          <span style={styles.rateLabel}>Процентная ставка</span>
          <span style={styles.rateValue}>{credit.interestRate}%</span>
        </div>

        <div style={styles.datesGrid}>
          <div style={styles.dateItem}>
            <span style={styles.dateLabel}>Начало</span>
            <span style={styles.dateValue}>{formatDate(credit.startDate)}</span>
          </div>
          <div style={styles.dateItem}>
            <span style={styles.dateLabel}>Окончание</span>
            <span style={styles.dateValue}>{formatDate(credit.endDate)}</span>
          </div>
        </div>

        <div style={styles.idsSection}>
          <p style={styles.idText}>Счет: {credit.accountId}</p>
          <p style={styles.idText}>Тариф: {credit.tariffId}</p>
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
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
      borderColor: '#3b82f6'
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
  creditIcon: {
    fontSize: '2em'
  },
  creditInfo: {
    flex: 1
  },
  creditId: {
    margin: '0 0 5px 0',
    color: '#1e293b',
    fontSize: '1.1em',
    fontWeight: '600'
  },
  userId: {
    margin: 0,
    color: '#64748b',
    fontSize: '0.85em'
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.85em',
    fontWeight: '500'
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
    padding: '10px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px'
  },
  amountItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  amountLabel: {
    color: '#64748b',
    fontSize: '0.8em',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  amountValue: {
    color: '#1e293b',
    fontSize: '1.2em',
    fontWeight: '600'
  },
  rateSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px'
  },
  rateLabel: {
    color: '#64748b',
    fontSize: '0.9em'
  },
  rateValue: {
    color: '#3b82f6',
    fontSize: '1.3em',
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
    color: '#64748b',
    fontSize: '0.8em',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  dateValue: {
    color: '#1e293b',
    fontSize: '0.95em'
  },
  idsSection: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    fontSize: '0.85em',
    color: '#64748b',
    wordBreak: 'break-all'
  },
  idText: {
    margin: '5px 0'
  }
};

export default CreditCard;
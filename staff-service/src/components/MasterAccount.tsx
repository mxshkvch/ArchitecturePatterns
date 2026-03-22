// staff-service/src/components/MasterAccount.jsx
import React, { useState, useEffect } from 'react';
import { getMasterAccount } from '../services/api';
import LoadingSpinner from './LoadingSpinner';

// Определяем интерфейс для данных счета
interface AccountData {
  id: string;
  accountNumber: string;
  userid: string;
  balance: number | string;
  currency: string;
  status: string;
  createdAt: string;
  closedAt: string | null;
}

const MasterAccount: React.FC = () => {
  const [account, setAccount] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMasterAccount = async () => {
      try {
        setLoading(true);
        console.log('🏦 Loading master account...');
        const data = await getMasterAccount();
        console.log('✅ Master account data:', data);
        setAccount(data);
        setError(null);
      } catch (err) {
        console.error('❌ Error loading master account:', err);
        setError('Не удалось загрузить информацию о мастер-счете');
      } finally {
        setLoading(false);
      }
    };

    loadMasterAccount();
  }, []);

  // Явно указываем типы для параметров
  const formatCurrency = (amount: number | string, currency: string = 'RUB'): string => {
    // Преобразуем строку в число, если нужно
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numericAmount)) return '0.00 ₽';
    
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency || 'RUB',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericAmount);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return '#2ecc71';
      case 'INACTIVE':
        return '#95a5a6';
      case 'BLOCKED':
        return '#e74c3c';
      case 'CLOSED':
        return '#95a5a6';
      default:
        return '#95a5a6';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'ACTIVE':
        return 'Активен';
      case 'INACTIVE':
        return 'Неактивен';
      case 'BLOCKED':
        return 'Заблокирован';
      case 'CLOSED':
        return 'Закрыт';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <LoadingSpinner />
          <p style={styles.loadingText}>Загрузка информации о мастер-счете...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <h2>Ошибка</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} style={styles.retryButton}>
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <h2>Мастер-счет не найден</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>🏦 Мастер-счет банка</h1>
          <div style={styles.accountNumber}>
            Счет: {account.accountNumber}
          </div>
        </div>

        <div style={styles.balanceSection}>
          <div style={styles.balanceCard}>
            <div style={styles.balanceLabel}>Текущий баланс</div>
            <div style={styles.balanceValue}>
              {formatCurrency(account.balance, account.currency)}
            </div>
          </div>
        </div>

        <div style={styles.detailsGrid}>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>ID счета:</span>
            <span style={styles.detailValue}>{account.id}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Валюта:</span>
            <span style={styles.detailValue}>{account.currency || 'RUB'}</span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Статус:</span>
            <span style={{
              ...styles.statusBadge,
              backgroundColor: getStatusColor(account.status) + '20',
              color: getStatusColor(account.status)
            }}>
              {getStatusText(account.status)}
            </span>
          </div>
          <div style={styles.detailItem}>
            <span style={styles.detailLabel}>Создан:</span>
            <span style={styles.detailValue}>{formatDate(account.createdAt)}</span>
          </div>
          {account.closedAt && (
            <div style={styles.detailItem}>
              <span style={styles.detailLabel}>Закрыт:</span>
              <span style={styles.detailValue}>{formatDate(account.closedAt)}</span>
            </div>
          )}
        </div>

        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            ℹ️ Мастер-счет является основным счетом банка. Все транзакции между пользователями 
            проходят через этот счет. Баланс отображается в реальном времени.
          </p>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    padding: '30px',
    border: '1px solid #e2e8f0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid #e2e8f0',
    flexWrap: 'wrap',
    gap: '15px'
  },
  title: {
    margin: 0,
    color: '#1e293b',
    fontSize: '1.8em',
    fontWeight: '600'
  },
  accountNumber: {
    padding: '8px 16px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    color: '#64748b',
    fontFamily: 'monospace',
    fontSize: '0.9em'
  },
  balanceSection: {
    marginBottom: '30px',
    padding: '20px',
    borderRadius: '12px'
  },
  balanceCard: {
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0'
  },
  balanceLabel: {
    fontSize: '0.9em',
    color: '#64748b',
    marginBottom: '10px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  balanceValue: {
    fontSize: '2.5em',
    fontWeight: 'bold',
    color: '#1e293b'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '15px',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px'
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 0'
  },
  detailLabel: {
    minWidth: '100px',
    color: '#64748b',
    fontSize: '0.9em',
    fontWeight: '500'
  },
  detailValue: {
    color: '#1e293b',
    fontSize: '0.95em',
    wordBreak: 'break-all'
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.85em',
    fontWeight: '500',
    display: 'inline-block'
  },
  infoBox: {
    padding: '15px 20px',
    backgroundColor: '#eff6ff',
    borderRadius: '8px',
    borderLeft: '4px solid #3b82f6'
  },
  infoText: {
    margin: 0,
    color: '#1e40af',
    fontSize: '0.9em',
    lineHeight: '1.5'
  },
  loadingText: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#64748b'
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    padding: '40px',
    textAlign: 'center',
    border: '1px solid #e2e8f0'
  },
  retryButton: {
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    marginTop: '20px',
    transition: 'background-color 0.2s'
  }
};

export default MasterAccount;
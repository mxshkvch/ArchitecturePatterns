import React from 'react';
import { useMasterAccount } from '../hooks/UseMasterAccount';
import { BalanceCard } from '../ui/BalanceCard';
import { AccountDetailsGrid } from '../ui/AccountDetailsGrid';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage';
import { InfoBox } from '../../../shared/ui/InfoBox';
import { useTheme } from '../../../ThemeContext';

export const MasterAccount = () => {
  const { account, loading, error, refreshing, refresh, formatBalance } = useMasterAccount();
  const { isDarkMode } = useTheme();

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
        <div style={styles.card}>
          <ErrorMessage error={error} onRetry={refresh} />
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <InfoBox type="error" icon="⚠️">
            Мастер-счет не найден. Пожалуйста, обратитесь к администратору.
          </InfoBox>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      ...styles.container,
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div style={{
        ...styles.card,
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--border-color)'
      }}>
        <div style={styles.header}>
          <h1 style={{
            ...styles.title,
            color: 'var(--text-color)'
          }}>
            🏦 Мастер-счет банка
          </h1>
          <div style={{
            ...styles.accountNumber,
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-secondary)'
          }}>
            Счет: {account.accountNumber}
          </div>
        </div>

        <BalanceCard
          balance={account.balance}
          currency={account.currency}
          onRefresh={refresh}
          isRefreshing={refreshing}
        />

        <AccountDetailsGrid account={account} />

        <InfoBox type="info" icon="ℹ️">
          Мастер-счет является основным счетом банка. Все транзакции между пользователями 
          проходят через этот счет. Баланс отображается в реальном времени.
        </InfoBox>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 20px',
    minHeight: '100vh',
    transition: 'background-color 0.3s ease'
  },
  card: {
    borderRadius: '16px',
    padding: '30px',
    border: '1px solid',
    transition: 'all 0.3s ease'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    paddingBottom: '20px',
    borderBottom: '1px solid var(--border-color)',
    flexWrap: 'wrap',
    gap: '15px'
  },
  title: {
    margin: 0,
    fontSize: '1.8em',
    fontWeight: '600',
    transition: 'color 0.3s ease'
  },
  accountNumber: {
    padding: '8px 16px',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '0.9em',
    transition: 'all 0.3s ease'
  },
  loadingText: {
    textAlign: 'center',
    marginTop: '20px',
    color: 'var(--text-secondary)'
  }
};
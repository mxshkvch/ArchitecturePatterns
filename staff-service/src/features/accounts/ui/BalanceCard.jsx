import React from 'react';
import { formatCurrency } from '../../../shared/utils/formatters';
import { useTheme } from '../../../ThemeContext';

export const BalanceCard = ({ balance, currency, onRefresh, isRefreshing }) => {
  const { isDarkMode } = useTheme();

  return (
    <div style={{
      ...styles.container,
      backgroundColor: 'var(--card-bg)',
      borderColor: 'var(--border-color)'
    }}>
      <div style={styles.header}>
        <span style={{
          ...styles.label,
          color: 'var(--text-secondary)'
        }}>
          Текущий баланс
        </span>
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{
              ...styles.refreshButton,
              backgroundColor: 'var(--button-bg)',
              color: 'var(--text-secondary)',
              opacity: isRefreshing ? 0.5 : 1
            }}
            onMouseEnter={(e) => {
              if (!isRefreshing) {
                e.currentTarget.style.backgroundColor = 'var(--button-hover-bg)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isRefreshing) {
                e.currentTarget.style.backgroundColor = 'var(--button-bg)';
              }
            }}
          >
            {isRefreshing ? '⟳' : '🔄'}
          </button>
        )}
      </div>
      <div style={styles.balanceValue}>
        {formatCurrency(balance, currency)}
      </div>
      {isRefreshing && (
        <div style={styles.refreshingHint}>
          Обновление...
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center',
    padding: '30px',
    borderRadius: '16px',
    border: '1px solid',
    marginBottom: '30px',
    transition: 'all 0.3s ease'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  label: {
    fontSize: '0.9em',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  refreshButton: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1.1em',
    transition: 'all 0.2s',
    background: 'none'
  },
  balanceValue: {
    fontSize: '3em',
    fontWeight: 'bold',
    color: 'var(--text-color)',
    margin: '20px 0'
  },
  refreshingHint: {
    fontSize: '0.8em',
    color: 'var(--text-tertiary)',
    marginTop: '10px'
  }
};
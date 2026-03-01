import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAccountTransactions } from '../services/api';
import TransactionCard from './TransactionCard';
import LoadingSpinner from './LoadingSpinner';
import DateFilter from './DateFilter';

const AccountTransactions = () => {
  const { accountId, userId } = useParams();
  const navigate = useNavigate();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0
  });

  useEffect(() => {
    loadTransactions(0);
  }, [accountId, fromDate, toDate]);

  const loadTransactions = async (page = 0) => {
    try {
      setLoading(true);
      const data = await getAccountTransactions(
        accountId, 
        page, 
        20, 
        fromDate || null, 
        toDate || null
      );
      setTransactions(data.content || []);
      setPageInfo(data.page || { page: 0, size: 20, totalElements: 0, totalPages: 0 });
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить историю операций');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    loadTransactions(newPage);
  };

  const handleDateFilterChange = (newFromDate, newToDate) => {
    setFromDate(newFromDate);
    setToDate(newToDate);
  };

  const handleClearFilters = () => {
    setFromDate('');
    setToDate('');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return '#2ecc71';
      case 'WITHDRAWAL':
        return '#e74c3c';
      case 'TRANSFER':
        return '#3498db';
      case 'PAYMENT':
        return '#f39c12';
      default:
        return '#95a5a6';
    }
  };

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return 'Пополнение';
      case 'WITHDRAWAL':
        return 'Снятие';
      case 'TRANSFER':
        return 'Перевод';
      case 'PAYMENT':
        return 'Платеж';
      default:
        return type;
    }
  };

  if (loading && transactions.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button 
          onClick={() => navigate(`/users/${userId}`)} 
          style={styles.backButton}
        >
          ← Назад к счетам
        </button>
        <h1 style={styles.title}>История операций по счету</h1>
        <div style={styles.accountInfo}>
          Счет: <strong>{accountId.slice(0, 8)}...</strong>
        </div>
      </div>

      <DateFilter
        fromDate={fromDate}
        toDate={toDate}
        onDateChange={handleDateFilterChange}
        onClearFilters={handleClearFilters}
      />

      {error ? (
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
          <button onClick={() => loadTransactions(0)} style={styles.retryButton}>
            Попробовать снова
          </button>
        </div>
      ) : (
        <>
          {transactions.length === 0 ? (
            <div style={styles.emptyContainer}>
              <p style={styles.emptyText}>Операции по счету не найдены</p>
              {(fromDate || toDate) && (
                <button onClick={handleClearFilters} style={styles.clearFiltersButton}>
                  Сбросить фильтры
                </button>
              )}
            </div>
          ) : (
            <>
              <div style={styles.stats}>
                Найдено операций: <strong>{pageInfo.totalElements}</strong>
              </div>

              <div style={styles.transactionsList}>
                {transactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    formatDateTime={formatDateTime}
                    formatCurrency={formatCurrency}
                    getTransactionTypeColor={getTransactionTypeColor}
                    getTransactionTypeLabel={getTransactionTypeLabel}
                  />
                ))}
              </div>

              {pageInfo.totalPages > 1 && (
                <div style={styles.pagination}>
                  <button
                    onClick={() => handlePageChange(pageInfo.page - 1)}
                    disabled={pageInfo.page === 0}
                    style={styles.pageButton}
                  >
                    ←
                  </button>
                  
                  <span style={styles.pageInfo}>
                    Страница {pageInfo.page + 1} из {pageInfo.totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(pageInfo.page + 1)}
                    disabled={pageInfo.page === pageInfo.totalPages - 1}
                    style={styles.pageButton}
                  >
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f8fafc',
    minHeight: '100vh'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f1f5f9',
      borderColor: '#3b82f6',
      color: '#3b82f6'
    }
  },
  title: {
    margin: 0,
    color: '#1e293b',
    fontSize: '1.8em',
    fontWeight: '600'
  },
  accountInfo: {
    color: '#64748b',
    fontSize: '1em',
    padding: '8px 16px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px'
  },
  stats: {
    marginBottom: '20px',
    padding: '15px 20px',
    backgroundColor: 'white',
    borderRadius: '8px',
    color: '#64748b',
    fontSize: '1.1em',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  transactionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '30px'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  pageButton: {
    padding: '8px 16px',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'all 0.2s',
    ':hover:not(:disabled)': {
      backgroundColor: '#f8fafc',
      borderColor: '#3b82f6',
      color: '#3b82f6'
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed'
    }
  },
  pageInfo: {
    color: '#64748b',
    fontSize: '1em'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  errorText: {
    color: '#ef4444',
    fontSize: '1.2em',
    marginBottom: '20px'
  },
  retryButton: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#2563eb'
    }
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  emptyText: {
    color: '#64748b',
    fontSize: '1.2em',
    marginBottom: '20px'
  },
  clearFiltersButton: {
    padding: '10px 20px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f1f5f9',
      borderColor: '#3b82f6',
      color: '#3b82f6'
    }
  }
};

export default AccountTransactions;
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAccountTransactions } from '../services/api';
import TransactionCard from './TransactionCard';
import LoadingSpinner from './LoadingSpinner';
import DateFilter from './DateFilter';
import { useTheme } from '../ThemeContext';

const AccountTransactions = () => {
  const { accountId, userId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    size: 5,
    totalElements: 0,
    totalPages: 0
  });

  // Добавляем эффект для отладки
  useEffect(() => {
    console.log('Transactions pageInfo изменился:', pageInfo);
  }, [pageInfo]);

  useEffect(() => {
    loadTransactions(1);
  }, [accountId, fromDate, toDate]);

  const loadTransactions = async (page = 1) => {
    try {
      setLoading(true);
      console.log('Загружаем транзакции. Параметры:', { 
        accountId, 
        page, 
        size: pageInfo.size,
        fromDate: fromDate || null, 
        toDate: toDate || null 
      });
      
      const data = await getAccountTransactions(
        accountId, 
        page, 
        pageInfo.size,
        fromDate || null, 
        toDate || null
      );
      
      console.log('Полученные данные транзакций:', data);
      
      if (data && data.content && data.page) {
        setTransactions(data.content);
        
        setPageInfo({
          page: data.page.page + 1,
          size: data.page.size,
          totalElements: data.page.totalElements,
          totalPages: data.page.totalPages
        });
        
        console.log('Установлены транзакции:', data.content.length);
        console.log('Информация о пагинации (преобразована в 1-индексацию):', {
          page: data.page.page + 1,
          size: data.page.size,
          totalElements: data.page.totalElements,
          totalPages: data.page.totalPages
        });
      } else {
        console.warn('Неизвестный формат данных транзакций:', data);
        setTransactions([]);
      }
      
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить историю операций');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    console.log('Смена страницы транзакций на:', newPage);
    loadTransactions(newPage);
  };

  const handleDateFilterChange = (newFromDate, newToDate) => {
    setFromDate(newFromDate);
    setToDate(newToDate);
    loadTransactions(1);
  };

  const handleClearFilters = () => {
    setFromDate('');
    setToDate('');
    loadTransactions(1);
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
    <div style={{
      ...styles.container,
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div style={{
        ...styles.header,
        backgroundColor: 'var(--card-bg)',
        boxShadow: 'var(--shadow)'
      }}>
        <button 
          onClick={() => navigate(`/users/${userId}`)} 
          style={styles.backButton}
        >
          ← Назад к счетам
        </button>
        <h1 style={{
          ...styles.title,
          color: 'var(--text-color)'
        }}>История операций по счету</h1>
        <div style={{
          ...styles.accountInfo,
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-secondary)'
        }}>
          Счет: <strong style={{ color: 'var(--text-color)' }}>{accountId.slice(0, 8)}...</strong>
        </div>
      </div>

      <DateFilter
        fromDate={fromDate}
        toDate={toDate}
        onDateChange={handleDateFilterChange}
        onClearFilters={handleClearFilters}
      />

      {error ? (
        <div style={{
          ...styles.errorContainer,
          backgroundColor: 'var(--card-bg)',
          boxShadow: 'var(--shadow)'
        }}>
          <p style={{
            ...styles.errorText,
            color: 'var(--error-color)'
          }}>{error}</p>
          <button onClick={() => loadTransactions(1)} style={styles.retryButton}>
            Попробовать снова
          </button>
        </div>
      ) : (
        <>
          {transactions.length === 0 ? (
            <div style={{
              ...styles.emptyContainer,
              backgroundColor: 'var(--card-bg)',
              boxShadow: 'var(--shadow)'
            }}>
              <p style={{
                ...styles.emptyText,
                color: 'var(--text-secondary)'
              }}>Операции по счету не найдены</p>
              {(fromDate || toDate) && (
                <button onClick={handleClearFilters} style={styles.clearFiltersButton}>
                  Сбросить фильтры
                </button>
              )}
            </div>
          ) : (
            <>
              <div style={{
                ...styles.stats,
                backgroundColor: 'var(--card-bg)',
                boxShadow: 'var(--shadow)',
                color: 'var(--text-secondary)'
              }}>
                Найдено операций: <strong style={{ color: 'var(--text-color)' }}>{pageInfo.totalElements}</strong>
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

              {/* Отображаем пагинацию только если есть несколько страниц */}
              {pageInfo.totalPages > 1 && (
                <div style={{
                  ...styles.pagination,
                  backgroundColor: 'var(--card-bg)',
                  boxShadow: 'var(--shadow)'
                }}>
                  <button
                    onClick={() => handlePageChange(pageInfo.page - 1)}
                    disabled={pageInfo.page === 1}
                    style={{
                      ...styles.pageButton,
                      backgroundColor: 'var(--button-bg)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    ←
                  </button>
                  
                  {/* Отображаем номера страниц */}
                  <div style={styles.pageNumbers}>
                    {Array.from({ length: pageInfo.totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        style={{
                          ...styles.pageNumberButton,
                          backgroundColor: pageNum === pageInfo.page ? 'var(--primary-color)' : 'var(--button-bg)',
                          borderColor: 'var(--border-color)',
                          color: pageNum === pageInfo.page ? 'white' : 'var(--text-secondary)',
                          ...(pageNum === pageInfo.page ? styles.pageNumberButtonActive : {})
                        }}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(pageInfo.page + 1)}
                    disabled={pageInfo.page >= pageInfo.totalPages}
                    style={{
                      ...styles.pageButton,
                      backgroundColor: 'var(--button-bg)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-secondary)'
                    }}
                  >
                    →
                  </button>
                </div>
              )}

              {/* Для отладки показываем информацию о пагинации */}
              <div style={{
                ...styles.debugInfo,
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)'
              }}>
                Текущая страница: {pageInfo.page} из {pageInfo.totalPages}, 
                Всего операций: {pageInfo.totalElements}, 
                Операций на странице: {pageInfo.size}
              </div>
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
    minHeight: '100vh',
    transition: 'background-color 0.3s ease'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '20px',
    borderRadius: '12px',
    transition: 'all 0.3s ease'
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: 'var(--button-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'var(--button-hover-bg)',
      borderColor: 'var(--primary-color)',
      color: 'var(--primary-color)'
    }
  },
  title: {
    margin: 0,
    fontSize: '1.8em',
    fontWeight: '600',
    transition: 'color 0.3s ease'
  },
  accountInfo: {
    fontSize: '1em',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  },
  stats: {
    marginBottom: '20px',
    padding: '15px 20px',
    borderRadius: '8px',
    fontSize: '1.1em',
    transition: 'all 0.3s ease'
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
    borderRadius: '12px',
    transition: 'all 0.3s ease'
  },
  pageNumbers: {
    display: 'flex',
    gap: '8px'
  },
  pageButton: {
    padding: '8px 16px',
    border: '1px solid',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    transition: 'all 0.2s',
    ':hover:not(:disabled)': {
      backgroundColor: 'var(--button-hover-bg)',
      borderColor: 'var(--primary-color)',
      color: 'var(--primary-color)'
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed'
    }
  },
  pageNumberButton: {
    minWidth: '40px',
    height: '40px',
    padding: '0 8px',
    border: '1px solid',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'var(--button-hover-bg)',
      borderColor: 'var(--primary-color)'
    }
  },
  pageNumberButtonActive: {
    cursor: 'pointer',
    ':hover': {
      backgroundColor: 'var(--primary-hover)',
      color: 'white'
    }
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    borderRadius: '12px',
    transition: 'all 0.3s ease'
  },
  errorText: {
    fontSize: '1.2em',
    marginBottom: '20px',
    transition: 'color 0.3s ease'
  },
  retryButton: {
    padding: '12px 24px',
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: 'var(--primary-hover)'
    }
  },
  emptyContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    borderRadius: '12px',
    transition: 'all 0.3s ease'
  },
  emptyText: {
    fontSize: '1.2em',
    marginBottom: '20px',
    transition: 'color 0.3s ease'
  },
  clearFiltersButton: {
    padding: '10px 20px',
    backgroundColor: 'var(--button-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'var(--button-hover-bg)',
      borderColor: 'var(--primary-color)',
      color: 'var(--primary-color)'
    }
  },
  debugInfo: {
    marginTop: '20px',
    padding: '10px',
    borderRadius: '8px',
    fontSize: '0.9em',
    textAlign: 'center',
    transition: 'all 0.3s ease'
  }
};

export default AccountTransactions;
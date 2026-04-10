import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getUserAccounts } from '../services/api'; 
import AccountCard from './AccountCard';
import LoadingSpinner from './LoadingSpinner';
import { useTheme } from '../ThemeContext';

const UserAccounts = () => {
  const { userId } = useParams();
  const { isDarkMode } = useTheme();
  
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0
  });

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Загрузка счетов
  const loadAccounts = useCallback(async (page = 0) => {
    try {
      setLoading(true);
      const data = await getUserAccounts(userId, page, 20, selectedStatus || undefined);
      setAccounts(data.content || []);
      setPageInfo(data.page || { page: 0, size: 20, totalElements: 0, totalPages: 0 });
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить счета пользователя');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId, selectedStatus]);

  // Загружаем счета при монтировании и изменении фильтра
  useEffect(() => {
    loadAccounts(0);
  }, [loadAccounts]);

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  const handlePageChange = (newPage) => {
    loadAccounts(newPage);
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency || 'RUB',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
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

  if (loading && accounts.length === 0) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div style={{
        ...styles.errorContainer,
        backgroundColor: 'var(--card-bg)',
        boxShadow: 'var(--shadow)'
      }}>
        <p style={{
          ...styles.errorText,
          color: 'var(--error-color)'
        }}>{error}</p>
        <button onClick={() => loadAccounts(0)} style={styles.retryButton}>
          Попробовать снова
        </button>
      </div>
    );
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
        <h1 style={{
          ...styles.title,
          color: 'var(--text-color)'
        }}>Счета пользователя</h1>
        <div style={{
          ...styles.totalAccounts,
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-secondary)'
        }}>
          Всего счетов: <strong style={{ color: 'var(--text-color)' }}>{pageInfo.totalElements}</strong>
        </div>
      </div>

      {/* Фильтр по статусу счета */}
      <div style={{
        ...styles.filterContainer,
        backgroundColor: 'var(--card-bg)',
        boxShadow: 'var(--shadow)'
      }}>
        <span style={{
          ...styles.filterLabel,
          color: 'var(--text-secondary)'
        }}>Статус счета:</span>
        <div style={styles.buttonGroup}>
          <button
            onClick={() => handleStatusChange('')}
            style={{
              ...styles.filterButton,
              backgroundColor: selectedStatus === '' ? 'var(--primary-color)' : 'var(--button-bg)',
              borderColor: 'var(--border-color)',
              color: selectedStatus === '' ? 'white' : 'var(--text-secondary)',
              ...(selectedStatus === '' ? styles.filterButtonActive : {})
            }}
          >
            Все
          </button>
          {['ACTIVE', 'BLOCKED', 'CLOSED'].map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              style={{
                ...styles.filterButton,
                backgroundColor: selectedStatus === status ? 'var(--primary-color)' : 'var(--button-bg)',
                borderColor: 'var(--border-color)',
                color: selectedStatus === status ? 'white' : 'var(--text-secondary)',
                ...(selectedStatus === status ? styles.filterButtonActive : {})
              }}
            >
              {status === 'ACTIVE' ? 'Активные' :
               status === 'BLOCKED' ? 'Заблокированные' :
               'Закрытые'}
            </button>
          ))}
        </div>
      </div>

      {accounts.length === 0 ? (
        <div style={{
          ...styles.noAccounts,
          backgroundColor: 'var(--card-bg)',
          color: 'var(--text-secondary)'
        }}>
          <p>У пользователя нет счетов</p>
        </div>
      ) : (
        <>
          <div style={styles.accountsGrid}>
            {accounts.map((account) => (
              <AccountCard
                key={account.id}
                account={account}
                formatDate={formatDate} 
                formatCurrency={formatCurrency}
                getStatusColor={getStatusColor}
                userId={userId}
              />
            ))}
          </div>

          {pageInfo.totalPages > 1 && (
            <div style={{
              ...styles.pagination,
              backgroundColor: 'var(--card-bg)',
              boxShadow: 'var(--shadow)'
            }}>
              <button
                onClick={() => handlePageChange(pageInfo.page - 1)}
                disabled={pageInfo.page === 0}
                style={{
                  ...styles.pageButton,
                  backgroundColor: 'var(--button-bg)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-secondary)'
                }}
              >
                ←
              </button>
              
              <span style={{
                ...styles.pageInfo,
                color: 'var(--text-secondary)'
              }}>
                Страница {pageInfo.page + 1} из {pageInfo.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pageInfo.page + 1)}
                disabled={pageInfo.page === pageInfo.totalPages - 1}
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
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
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
    marginBottom: '25px',
    padding: '20px',
    borderRadius: '16px',
    transition: 'all 0.3s ease'
  },
  title: {
    margin: 0,
    fontSize: '1.8em',
    fontWeight: '600',
    transition: 'color 0.3s ease'
  },
  totalAccounts: {
    fontSize: '1.1em',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  },
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '25px',
    padding: '15px 20px',
    borderRadius: '12px',
    transition: 'all 0.3s ease'
  },
  filterLabel: {
    fontSize: '0.95em',
    fontWeight: '500',
    transition: 'color 0.3s ease'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  filterButton: {
    padding: '8px 16px',
    border: '1px solid',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: 'var(--button-hover-bg)',
      borderColor: 'var(--primary-color)',
      color: 'var(--primary-color)'
    }
  },
  filterButtonActive: {
    ':hover': {
      backgroundColor: 'var(--primary-hover)',
      color: 'white'
    }
  },
  accountsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px',
    padding: '20px',
    borderRadius: '12px',
    transition: 'all 0.3s ease'
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
  pageInfo: {
    fontSize: '1em',
    transition: 'color 0.3s ease'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    borderRadius: '16px',
    maxWidth: '500px',
    margin: '100px auto',
    transition: 'all 0.3s ease'
  },
  errorText: {
    fontSize: '1.2em',
    marginBottom: '20px',
    transition: 'color 0.3s ease'
  },
  retryButton: {
    padding: '10px 20px',
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95em',
    marginTop: '10px',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: 'var(--primary-hover)'
    }
  },
  noAccounts: {
    textAlign: 'center',
    padding: '60px 20px',
    borderRadius: '16px',
    fontSize: '1.1em',
    transition: 'all 0.3s ease'
  }
};

export default UserAccounts;
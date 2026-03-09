import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { getUserAccounts } from '../services/api'; // 👈 Только этот импорт
import AccountCard from './AccountCard';
import LoadingSpinner from './LoadingSpinner';

const UserAccounts = () => {
  const { userId } = useParams();
  
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
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>{error}</p>
        <button onClick={() => loadAccounts(0)} style={styles.retryButton}>
          Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Счета пользователя</h1>
        <div style={styles.totalAccounts}>
          Всего счетов: <strong>{pageInfo.totalElements}</strong>
        </div>
      </div>

      {/* Фильтр по статусу счета */}
      <div style={styles.filterContainer}>
        <span style={styles.filterLabel}>Статус счета:</span>
        <div style={styles.buttonGroup}>
          <button
            onClick={() => handleStatusChange('')}
            style={{
              ...styles.filterButton,
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
        <div style={styles.noAccounts}>
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
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
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
    marginBottom: '25px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  title: {
    margin: 0,
    color: '#1e293b',
    fontSize: '1.8em',
    fontWeight: '600'
  },
  totalAccounts: {
    color: '#64748b',
    fontSize: '1.1em',
    padding: '8px 16px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px'
  },
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '25px',
    padding: '15px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
  },
  filterLabel: {
    color: '#64748b',
    fontSize: '0.95em',
    fontWeight: '500'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  filterButton: {
    padding: '8px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f8fafc',
      borderColor: '#3b82f6'
    }
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6'
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
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
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
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    maxWidth: '500px',
    margin: '100px auto'
  },
  errorText: {
    color: '#ef4444',
    fontSize: '1.2em',
    marginBottom: '20px'
  },
  retryButton: {
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95em',
    marginTop: '10px'
  },
  noAccounts: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '16px',
    color: '#64748b',
    fontSize: '1.1em'
  }
};

export default UserAccounts;
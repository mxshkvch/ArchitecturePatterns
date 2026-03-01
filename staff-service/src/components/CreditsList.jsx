import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCredits } from '../services/api';
import CreditCard from './CreditCard';
import LoadingSpinner from './LoadingSpinner';

const CreditsList = () => {
  const navigate = useNavigate();
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0
  });

  useEffect(() => {
    loadCredits(0);
  }, []);

  const loadCredits = async (page = 0) => {
    try {
      setLoading(true);
      const data = await getCredits(page, 20);
      setCredits(data.content || []);
      setPageInfo(data.page || { page: 0, size: 20, totalElements: 0, totalPages: 0 });
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить список кредитов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    loadCredits(newPage);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return '#2ecc71';
      case 'PAID':
        return '#3498db';
      case 'OVERDUE':
        return '#e74c3c';
      case 'CLOSED':
        return '#95a5a6';
      default:
        return '#95a5a6';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'Активный';
      case 'PAID':
        return 'Оплачен';
      case 'OVERDUE':
        return 'Просрочен';
      case 'CLOSED':
        return 'Закрыт';
      default:
        return status;
    }
  };

  if (loading && credits.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={() => navigate('/users')} style={styles.backButton}>
          ← Назад к пользователям
        </button>
        <h1 style={styles.title}>Список кредитов</h1>
        <div style={styles.stats}>
          Всего кредитов: <strong>{pageInfo.totalElements}</strong>
        </div>
      </div>

      {error ? (
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
          <button onClick={() => loadCredits(0)} style={styles.retryButton}>
            Попробовать снова
          </button>
        </div>
      ) : (
        <>
          {credits.length === 0 ? (
            <div style={styles.emptyContainer}>
              <p style={styles.emptyText}>Кредиты не найдены</p>
            </div>
          ) : (
            <>
              <div style={styles.creditsGrid}>
                {credits.map((credit) => (
                  <CreditCard
                    key={credit.id}
                    credit={credit}
                    formatDate={formatDate}
                    formatCurrency={formatCurrency}
                    getStatusColor={getStatusColor}
                    getStatusLabel={getStatusLabel}
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
    fontSize: '2em',
    fontWeight: '600'
  },
  stats: {
    color: '#64748b',
    fontSize: '1.1em',
    padding: '8px 16px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px'
  },
  creditsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginTop: '30px',
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
    fontSize: '1.2em'
  }
};

export default CreditsList;
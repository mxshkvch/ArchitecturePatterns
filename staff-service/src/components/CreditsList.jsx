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
    page: 1, // Оставляем 1 (1-индексация)
    size: 5, // Размер страницы 5
    totalElements: 0,
    totalPages: 0
  });

  // Добавляем эффект для отладки
  useEffect(() => {
    console.log('Credits pageInfo изменился:', pageInfo);
  }, [pageInfo]);

  useEffect(() => {
    loadCredits(1); // Загружаем первую страницу (индекс 1)
  }, []);

  const loadCredits = async (page = 1) => {
    try {
      setLoading(true);
      console.log('Загружаем кредиты. Параметры:', { page, size: pageInfo.size });
      
      const data = await getCredits(page, pageInfo.size);
      console.log('Полученные данные кредитов:', data);
      
      if (data && data.content && data.page) {
        // Формат Spring Page
        setCredits(data.content);
        
        // Информация о пагинации находится в data.page
        // API возвращает page с 0-индексацией, поэтому преобразуем
        setPageInfo({
          page: data.page.page , // Преобразуем из 0-индексации в 1-индексацию
          size: data.page.size,
          totalElements: data.page.totalElements,
          totalPages: data.page.totalPages
        });
        
        console.log('Установлены кредиты:', data.content.length);
        console.log('Информация о пагинации (преобразована в 1-индексацию):', {
          page: data.page.page ,
          size: data.page.size,
          totalElements: data.page.totalElements,
          totalPages: data.page.totalPages
        });
      } else {
        console.warn('Неизвестный формат данных кредитов:', data);
        setCredits([]);
      }
      
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить список кредитов');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    console.log('Смена страницы кредитов на:', newPage);
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
      minimumFractionDigits: 2 // Меняем с 5 на 2 для нормального отображения
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

  if (loading && credits.length === 0) { // Меняем с === 1 на === 0
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
          <button onClick={() => loadCredits(1)} style={styles.retryButton}>
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

              {/* Отображаем пагинацию только если есть несколько страниц */}
              {pageInfo.totalPages > 1 && (
                <div style={styles.pagination}>
                  <button
                    onClick={() => handlePageChange(pageInfo.page - 1)}
                    disabled={pageInfo.page === 1}
                    style={styles.pageButton}
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
                    style={styles.pageButton}
                  >
                    →
                  </button>
                </div>
              )}

              {/* Для отладки показываем информацию о пагинации */}
              <div style={styles.debugInfo}>
                Текущая страница: {pageInfo.page} из {pageInfo.totalPages}, 
                Всего кредитов: {pageInfo.totalElements}, 
                Кредитов на странице: {pageInfo.size}
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
  pageNumbers: {
    display: 'flex',
    gap: '8px'
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
  pageNumberButton: {
    minWidth: '40px',
    height: '40px',
    padding: '0 8px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f8fafc',
      borderColor: '#3b82f6',
      color: '#3b82f6'
    }
  },
  pageNumberButtonActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6',
    ':hover': {
      backgroundColor: '#2563eb',
      color: 'white',
      borderColor: '#2563eb'
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
  },
  debugInfo: {
    marginTop: '20px',
    padding: '10px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px',
    color: '#64748b',
    fontSize: '0.9em',
    textAlign: 'center'
  }
};

export default CreditsList;
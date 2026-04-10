import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCredits } from '../services/api';
import CreditCard from './CreditCard';
import LoadingSpinner from './LoadingSpinner';
import { useTheme } from '../ThemeContext';

const CreditsList = () => {
  const navigate = useNavigate();
  const [credits, setCredits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    size: 5,
    totalElements: 0,
    totalPages: 0
  });
  const { isDarkMode } = useTheme();

  // Добавляем эффект для отладки
  useEffect(() => {
    console.log('Credits pageInfo изменился:', pageInfo);
  }, [pageInfo]);

  useEffect(() => {
    loadCredits(1);
  }, []);

  const loadCredits = async (page = 1) => {
    try {
      setLoading(true);
      console.log('Загружаем кредиты. Параметры:', { page, size: pageInfo.size });
      
      const data = await getCredits(page, pageInfo.size);
      console.log('Полученные данные кредитов:', data);
      
      if (data && data.content && data.page) {
        setCredits(data.content);
        
        setPageInfo({
          page: data.page.page,
          size: data.page.size,
          totalElements: data.page.totalElements,
          totalPages: data.page.totalPages
        });
        
        console.log('Установлены кредиты:', data.content.length);
        console.log('Информация о пагинации:', {
          page: data.page.page,
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
          onClick={() => navigate('/users')} 
          style={styles.backButton}
        >
          ← Назад к пользователям
        </button>
        <h1 style={{
          ...styles.title,
          color: 'var(--text-color)'
        }}>Список кредитов</h1>
        <div style={{
          ...styles.stats,
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-secondary)'
        }}>
          Всего кредитов: <strong style={{ color: 'var(--text-color)' }}>{pageInfo.totalElements}</strong>
        </div>
      </div>

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
          <button onClick={() => loadCredits(1)} style={styles.retryButton}>
            Попробовать снова
          </button>
        </div>
      ) : (
        <>
          {credits.length === 0 ? (
            <div style={{
              ...styles.emptyContainer,
              backgroundColor: 'var(--card-bg)',
              boxShadow: 'var(--shadow)'
            }}>
              <p style={{
                ...styles.emptyText,
                color: 'var(--text-secondary)'
              }}>Кредиты не найдены</p>
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
    fontSize: '2em',
    fontWeight: '600',
    transition: 'color 0.3s ease'
  },
  stats: {
    fontSize: '1.1em',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.3s ease'
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
    transition: 'color 0.3s ease'
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

export default CreditsList;
import React, { useState } from 'react';
import { useDelinquenciesQuery } from '../../../entities/credit/api/creditApi';
import { useTheme } from '../../../ThemeContext';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { PaginationControls } from '../../../shared/ui/PaginationControls';
import { formatDate, formatCurrency } from '../../../shared/utils/formatters';

export const DelinquenciesModal = ({ isOpen, onClose, userId, userName }) => {
  const { isDarkMode } = useTheme();
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useDelinquenciesQuery(userId, page, size);

  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': '#2ecc71',
      'PAID': '#3498db',
      'OVERDUE': '#e74c3c',
      'DEFAULT': '#e74c3c'
    };
    return colors[status] || '#95a5a6';
  };

  const getStatusLabel = (status) => {
    const labels = {
      'ACTIVE': 'Активен',
      'PAID': 'Оплачен',
      'OVERDUE': 'Просрочен',
      'DEFAULT': 'Дефолт'
    };
    return labels[status] || status;
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  if (!isOpen) return null;

  const delinquencies = data?.content || [];
  const pageInfo = data?.page ? {
    page: data.page.page - 1,
    size: data.page.size,
    totalElements: data.page.totalElements,
    totalPages: data.page.totalPages,
  } : {
    page: 0,
    size,
    totalElements: 0,
    totalPages: 0,
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={{
        ...styles.modal,
        backgroundColor: 'var(--card-bg)'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{
          ...styles.header,
          borderBottomColor: 'var(--border-color)',
          backgroundColor: 'var(--bg-secondary)'
        }}>
          <h2 style={{
            ...styles.title,
            color: 'var(--text-color)'
          }}>⚠️ Просроченные кредиты</h2>
          <button 
            onClick={onClose} 
            style={{
              ...styles.closeButton,
              color: 'var(--text-secondary)'
            }}
          >
            ✕
          </button>
        </div>
        
        <div style={{
          ...styles.userInfo,
          backgroundColor: 'var(--bg-secondary)',
          borderBottomColor: 'var(--border-color)',
          color: 'var(--text-color)'
        }}>
          <strong>Пользователь:</strong> {userName}
        </div>

        {isLoading && (
          <div style={styles.loadingContainer}>
            <LoadingSpinner text="Загрузка просроченных кредитов..." />
          </div>
        )}

        {error && (
          <div style={styles.errorContainer}>
            <ErrorMessage error="Не удалось загрузить список просроченных кредитов" onRetry={refetch} />
          </div>
        )}

        {!isLoading && !error && delinquencies.length === 0 && (
          <EmptyState 
            message="Нет просроченных кредитов"
            icon="✅"
          />
        )}

        {!isLoading && !error && delinquencies.length > 0 && (
          <>
            <div style={styles.stats}>
              Всего просрочек: <strong>{pageInfo.totalElements}</strong>
            </div>
            
            <div style={styles.list}>
              {delinquencies.map((item) => (
                <div key={item.creditId} style={{
                  ...styles.item,
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)'
                }}>
                  <div style={styles.itemHeader}>
                    <span style={{
                      ...styles.statusBadge,
                      backgroundColor: `${getStatusColor(item.status)}20`,
                      color: getStatusColor(item.status)
                    }}>
                      {getStatusLabel(item.status)}
                    </span>
                    <span style={styles.itemId}>
                      Кредит #{item.creditId?.slice(0, 8)}...
                    </span>
                  </div>
                  
                  <div style={styles.itemDetails}>
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Сумма долга:</span>
                      <span style={styles.detailValue}>
                        {formatCurrency(item.remainingAmount)}
                      </span>
                    </div>
                    
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Срок оплаты:</span>
                      <span style={styles.detailValue}>
                        {formatDate(item.dueDate)}
                      </span>
                    </div>
                    
                    <div style={styles.detailRow}>
                      <span style={styles.detailLabel}>Просрочено дней:</span>
                      <span style={{
                        ...styles.daysOverdue,
                        color: item.daysOverdue > 30 ? '#e74c3c' : '#f39c12'
                      }}>
                        {item.daysOverdue} дней
                      </span>
                    </div>
                    
                    {item.accountId && (
                      <div style={styles.detailRow}>
                        <span style={styles.detailLabel}>Счет:</span>
                        <span style={styles.detailValue}>
                          {item.accountId?.slice(0, 12)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {pageInfo.totalPages > 1 && (
              <PaginationControls
                pageInfo={pageInfo}
                onPageChange={handlePageChange}
                showInfo={true}
              />
            )}
          </>
        )}

        <div style={styles.footer}>
          <button 
            onClick={onClose} 
            style={styles.closeModalButton}
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    animation: 'fadeIn 0.3s ease'
  },
  modal: {
    borderRadius: '16px',
    maxWidth: '700px',
    width: '90%',
    maxHeight: '85vh',
    overflow: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    animation: 'slideIn 0.3s ease'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 25px',
    borderBottom: '1px solid',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  title: {
    margin: 0,
    fontSize: '1.5em'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '5px',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'all 0.2s'
  },
  userInfo: {
    padding: '15px 25px',
    borderBottom: '1px solid',
    fontSize: '1em'
  },
  stats: {
    padding: '15px 25px',
    fontSize: '1em',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--border-color)'
  },
  list: {
    padding: '20px 25px',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  item: {
    borderRadius: '12px',
    padding: '15px',
    border: '1px solid',
    transition: 'transform 0.2s'
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '12px',
    paddingBottom: '10px',
    borderBottom: '1px solid var(--border-color)'
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '0.85em',
    fontWeight: '500'
  },
  itemId: {
    fontSize: '0.85em',
    color: 'var(--text-secondary)'
  },
  itemDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  detailLabel: {
    fontSize: '0.85em',
    color: 'var(--text-secondary)'
  },
  detailValue: {
    fontSize: '0.9em',
    fontWeight: '500',
    color: 'var(--text-color)'
  },
  daysOverdue: {
    fontSize: '0.9em',
    fontWeight: '600'
  },
  loadingContainer: {
    padding: '60px 20px',
    textAlign: 'center'
  },
  errorContainer: {
    padding: '40px 20px'
  },
  footer: {
    padding: '15px 25px',
    borderTop: '1px solid var(--border-color)',
    textAlign: 'center',
    position: 'sticky',
    bottom: 0,
    backgroundColor: 'var(--card-bg)'
  },
  closeModalButton: {
    padding: '10px 20px',
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'background-color 0.2s'
  }
};

export default DelinquenciesModal;
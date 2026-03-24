// features/credits/ui/RatingModal.jsx
import React from 'react';
import { useUserRating } from '../../../entities/credit/api/creditApi';
import { useTheme } from '../../../ThemeContext';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';

export const RatingModal = ({ isOpen, onClose, userId, userName }) => {
  const { isDarkMode } = useTheme();
  const { data: rating, isLoading, error } = useUserRating(userId);

  // Функции для работы с процентами (0-100)
  const getProbabilityColor = (probabilityPercent) => {
    if (probabilityPercent >= 80) return '#2ecc71';
    if (probabilityPercent >= 60) return '#f39c12';
    if (probabilityPercent >= 40) return '#e67e22';
    return '#e74c3c';
  };

  const getProbabilityLevel = (probabilityPercent) => {
    if (probabilityPercent >= 80) return 'Отличный';
    if (probabilityPercent >= 60) return 'Хороший';
    if (probabilityPercent >= 40) return 'Средний';
    if (probabilityPercent >= 20) return 'Низкий';
    return 'Критический';
  };

  if (!isOpen) return null;

  // Вычисляем процент для отображения
  const probabilityPercent = rating?.repaymentProbability 
    ? rating.repaymentProbability * 100 
    : 0;

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
          }}>📊 Кредитный рейтинг</h2>
          <button 
            onClick={onClose} 
            style={{
              ...styles.closeButton,
              color: 'var(--text-secondary)'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--button-hover-bg)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
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
            <LoadingSpinner text="Загрузка рейтинга..." />
          </div>
        )}

        {error && (
          <div style={{
            ...styles.errorContainer,
            backgroundColor: 'var(--error-color)20'
          }}>
            <p style={{
              ...styles.errorText,
              color: 'var(--error-color)'
            }}>Не удалось загрузить рейтинг пользователя</p>
            <p style={styles.errorDetail}>{error.message}</p>
          </div>
        )}

        {!isLoading && !error && rating && (
          <div style={styles.content}>
            <div style={styles.probabilitySection}>
              <div style={styles.probabilityCircle}>
                <div style={{
                  ...styles.probabilityValue,
                  color: 'var(--text-color)'
                }}>
                  {probabilityPercent.toFixed(1)}%
                </div>
                <div style={{
                  ...styles.probabilityLabel,
                  color: 'var(--text-secondary)'
                }}>
                  Вероятность погашения
                </div>
              </div>
              <div style={styles.probabilityLevel}>
                <span style={{ 
                  color: getProbabilityColor(probabilityPercent), 
                  fontSize: '24px' 
                }}>●</span>
                <span style={{
                  ...styles.levelText,
                  color: 'var(--text-color)'
                }}>
                  {getProbabilityLevel(probabilityPercent)} уровень
                </span>
              </div>
            </div>

            <div style={styles.statsGrid}>
              <div style={{
                ...styles.statCard,
                backgroundColor: 'var(--bg-secondary)'
              }}>
                <div style={{
                  ...styles.statValue,
                  color: 'var(--text-color)'
                }}>{rating.activeCredits || 0}</div>
                <div style={{
                  ...styles.statLabel,
                  color: 'var(--text-secondary)'
                }}>Активных кредитов</div>
              </div>
              <div style={{
                ...styles.statCard,
                backgroundColor: 'var(--bg-secondary)'
              }}>
                <div style={{
                  ...styles.statValue,
                  color: 'var(--text-color)'
                }}>{rating.paidCredits || 0}</div>
                <div style={{
                  ...styles.statLabel,
                  color: 'var(--text-secondary)'
                }}>Погашенных кредитов</div>
              </div>
              <div style={{
                ...styles.statCard,
                backgroundColor: 'var(--bg-secondary)'
              }}>
                <div style={{
                  ...styles.statValue,
                  color: rating.overdueCredits > 0 ? 'var(--error-color)' : 'var(--text-color)'
                }}>{rating.overdueCredits || 0}</div>
                <div style={{
                  ...styles.statLabel,
                  color: 'var(--text-secondary)'
                }}>Просроченных кредитов</div>
              </div>
              <div style={{
                ...styles.statCard,
                backgroundColor: 'var(--bg-secondary)'
              }}>
                <div style={{
                  ...styles.statValue,
                  color: rating.defaultedCredits > 0 ? 'var(--error-color)' : 'var(--text-color)'
                }}>{rating.defaultedCredits || 0}</div>
                <div style={{
                  ...styles.statLabel,
                  color: 'var(--text-secondary)'
                }}>Дефолтных кредитов</div>
              </div>
            </div>

            {rating.overdueCredits > 0 && (
              <div style={{
                ...styles.warningBox,
                backgroundColor: 'var(--warning-color)20',
                color: 'var(--warning-color)'
              }}>
                <span style={styles.warningIcon}>⚠️</span>
                <span>Внимание! У пользователя есть просроченные кредиты</span>
              </div>
            )}

            {rating.defaultedCredits > 0 && (
              <div style={{
                ...styles.dangerBox,
                backgroundColor: 'var(--error-color)20',
                color: 'var(--error-color)'
              }}>
                <span style={styles.dangerIcon}>🔴</span>
                <span>Критично! Зафиксированы дефолтные кредиты</span>
              </div>
            )}

            <div style={styles.footer}>
              <button 
                onClick={onClose} 
                style={styles.closeModalButton}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary-hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary-color)'}
              >
                Закрыть
              </button>
            </div>
          </div>
        )}

        {!isLoading && !error && !rating && (
          <div style={styles.noDataContainer}>
            <p style={{ color: 'var(--text-secondary)' }}>Нет данных о рейтинге</p>
            <button 
              onClick={onClose} 
              style={styles.closeModalButton}
            >
              Закрыть
            </button>
          </div>
        )}
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
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
    animation: 'slideIn 0.3s ease'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 25px',
    borderBottom: '1px solid'
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
  content: {
    padding: '25px'
  },
  probabilitySection: {
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
    marginBottom: '30px',
    paddingBottom: '30px',
    borderBottom: '1px solid var(--border-color)',
    flexWrap: 'wrap'
  },
  probabilityCircle: {
    textAlign: 'center',
    flex: 1
  },
  probabilityValue: {
    fontSize: '3em',
    fontWeight: 'bold',
    lineHeight: 1
  },
  probabilityLabel: {
    fontSize: '0.85em',
    marginTop: '5px'
  },
  probabilityLevel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '1.1em',
    flex: 1
  },
  levelText: {
    fontWeight: '500'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '15px',
    marginBottom: '20px'
  },
  statCard: {
    textAlign: 'center',
    padding: '15px',
    borderRadius: '8px',
    transition: 'transform 0.2s'
  },
  statValue: {
    fontSize: '1.8em',
    fontWeight: 'bold',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '0.85em'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '40px',
    margin: '20px',
    borderRadius: '8px'
  },
  errorText: {
    margin: '0 0 10px 0',
    fontWeight: 'bold'
  },
  errorDetail: {
    margin: 0,
    fontSize: '0.85em',
    opacity: 0.8
  },
  noDataContainer: {
    textAlign: 'center',
    padding: '40px'
  },
  warningBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 15px',
    borderRadius: '8px',
    marginTop: '15px'
  },
  warningIcon: {
    fontSize: '1.2em'
  },
  dangerBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 15px',
    borderRadius: '8px',
    marginTop: '15px'
  },
  dangerIcon: {
    fontSize: '1.2em'
  },
  footer: {
    marginTop: '25px',
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '1px solid var(--border-color)'
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

// Добавляем анимации
if (!document.querySelector('#rating-modal-styles')) {
  const style = document.createElement('style');
  style.id = 'rating-modal-styles';
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}

export default RatingModal;
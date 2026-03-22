// staff-service/src/components/RatingModal.jsx
import React, { useState, useEffect } from 'react';
import { getUserRating } from '../services/api';

const RatingModal = ({ isOpen, onClose, userId, userName }) => {
  const [rating, setRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && userId) {
      const loadRating = async () => {
        try {
          setLoading(true);
          console.log('📊 Loading rating for user:', userId);
          const data = await getUserRating(userId);
          console.log('✅ Rating data:', data);
          setRating(data);
          setError(null);
        } catch (err) {
          console.error('❌ Error loading rating:', err);
          setError('Не удалось загрузить рейтинг пользователя');
        } finally {
          setLoading(false);
        }
      };

      loadRating();
    }
  }, [isOpen, userId]);

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
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>📊 Кредитный рейтинг</h2>
          <button onClick={onClose} style={styles.closeButton}>✕</button>
        </div>
        
        <div style={styles.userInfo}>
          <strong>Пользователь:</strong> {userName}
        </div>

        {loading && (
          <div style={styles.loadingContainer}>
            <div className="spinner" style={styles.spinner}></div>
            <p>Загрузка рейтинга...</p>
          </div>
        )}

        {error && (
          <div style={styles.errorContainer}>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

        {!loading && !error && rating && (
          <div style={styles.content}>
            <div style={styles.probabilitySection}>
              <div style={styles.probabilityCircle}>
                <div style={styles.probabilityValue}>
                  {probabilityPercent.toFixed(1)}%
                </div>
                <div style={styles.probabilityLabel}>
                  Вероятность погашения
                </div>
              </div>
              <div style={styles.probabilityLevel}>
                <span style={{ 
                  color: getProbabilityColor(probabilityPercent), 
                  fontSize: '24px' 
                }}>●</span>
                <span style={styles.levelText}>
                  {getProbabilityLevel(probabilityPercent)} уровень
                </span>
              </div>
            </div>

            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{rating.activeCredits || 0}</div>
                <div style={styles.statLabel}>Активных кредитов</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{rating.paidCredits || 0}</div>
                <div style={styles.statLabel}>Погашенных кредитов</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{rating.overdueCredits || 0}</div>
                <div style={styles.statLabel}>Просроченных кредитов</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statValue}>{rating.defaultedCredits || 0}</div>
                <div style={styles.statLabel}>Дефолтных кредитов</div>
              </div>
            </div>

            {rating.overdueCredits > 0 && (
              <div style={styles.warningBox}>
                <span style={styles.warningIcon}>⚠️</span>
                <span>Внимание! У пользователя есть просроченные кредиты</span>
              </div>
            )}

            {rating.defaultedCredits > 0 && (
              <div style={styles.dangerBox}>
                <span style={styles.dangerIcon}>🔴</span>
                <span>Критично! Зафиксированы дефолтные кредиты</span>
              </div>
            )}

            <div style={styles.footer}>
              <button onClick={onClose} style={styles.closeModalButton}>
                Закрыть
              </button>
            </div>
          </div>
        )}

        {!loading && !error && !rating && (
          <div style={styles.noDataContainer}>
            <p>Нет данных о рейтинге</p>
            <button onClick={onClose} style={styles.closeModalButton}>
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
    backgroundColor: 'white',
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
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc'
  },
  title: {
    margin: 0,
    color: '#1e293b',
    fontSize: '1.5em'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#64748b',
    padding: '5px',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#e2e8f0'
    }
  },
  userInfo: {
    padding: '15px 25px',
    backgroundColor: '#f1f5f9',
    borderBottom: '1px solid #e2e8f0',
    color: '#1e293b',
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
    borderBottom: '1px solid #e2e8f0',
    flexWrap: 'wrap'
  },
  probabilityCircle: {
    textAlign: 'center',
    flex: 1
  },
  probabilityValue: {
    fontSize: '3em',
    fontWeight: 'bold',
    color: '#1e293b',
    lineHeight: 1
  },
  probabilityLabel: {
    fontSize: '0.85em',
    color: '#64748b',
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
    color: '#1e293b',
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
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    transition: 'transform 0.2s'
  },
  statValue: {
    fontSize: '1.8em',
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '0.85em',
    color: '#64748b'
  },
  loadingContainer: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    margin: '0 auto 15px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#fee2e2',
    margin: '20px',
    borderRadius: '8px'
  },
  errorText: {
    color: '#dc2626',
    margin: 0
  },
  noDataContainer: {
    textAlign: 'center',
    padding: '40px',
    color: '#64748b'
  },
  warningBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 15px',
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    marginTop: '15px',
    color: '#92400e'
  },
  warningIcon: {
    fontSize: '1.2em'
  },
  dangerBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 15px',
    backgroundColor: '#fee2e2',
    borderRadius: '8px',
    marginTop: '15px',
    color: '#991b1b'
  },
  dangerIcon: {
    fontSize: '1.2em'
  },
  footer: {
    marginTop: '25px',
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #e2e8f0'
  },
  closeModalButton: {
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#2563eb'
    }
  }
};

export default RatingModal;
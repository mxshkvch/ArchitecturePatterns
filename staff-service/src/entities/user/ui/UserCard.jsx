import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../ThemeContext';
import { updateUserStatus } from '../../../services/api';
import { formatDate, getStatusColor, getRoleLabel } from '../../../shared/utils';
import { RatingModal } from '../../../features/credits/ui/RaitingModal';
import { DelinquenciesModal } from '../../../features/credits/ui/DelinquenciesModal';
export const UserCard = ({ user, onStatusChange }) => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [showDelinquenciesModal, setShowDelinquenciesModal] = useState(false); 
  const handleCardClick = (e) => {
    if (e.target.closest('button')) return;
    navigate(`/users/${user.id}`);
  };

  const handleRatingClick = (e) => {
    e.stopPropagation();
    setShowRatingModal(true);
  };
  
  const handleDelinquenciesClick = (e) => {
    e.stopPropagation();
    setShowDelinquenciesModal(true);
  };
  const handleStatusToggle = async (e) => {
    e.stopPropagation();
    
    if (user.status === 'BLOCKED') {
      await updateStatus('ACTIVE');
    } else {
      setShowConfirm(true);
    }
  };

  const updateStatus = async (newStatus) => {
    try {
      setIsUpdating(true);
      await updateUserStatus(user.id, newStatus);
      if (onStatusChange) {
        onStatusChange(user.id, newStatus);
      }
      setShowConfirm(false);
    } catch (error) {
      alert('Не удалось изменить статус пользователя');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmBlock = () => {
    updateStatus('BLOCKED');
  };

  const handleCancelBlock = (e) => {
    e.stopPropagation();
    setShowConfirm(false);
  };

  const isBlocked = user.status === 'BLOCKED';
  const isActive = user.status === 'ACTIVE';

  const getButtonConfig = () => {
    if (isBlocked) {
      return {
        text: isUpdating ? '⏳' : '🔓',
        bgColor: '#10b981',
        title: 'Разблокировать пользователя'
      };
    } else {
      return {
        text: isUpdating ? '⏳' : '🔒',
        bgColor: '#ef4444',
        title: 'Заблокировать пользователя'
      };
    }
  };

  const buttonConfig = getButtonConfig();

  const getRoleBadgeStyle = () => {
    const roleStyles = {
      ADMIN: { bg: '#fee2e2', color: '#991b1b', darkBg: '#7f1a1a', darkColor: '#fecaca' },
      EMPLOYEE: { bg: '#dbeafe', color: '#1e40af', darkBg: '#1e3a8a', darkColor: '#bfdbfe' },
      CLIENT: { bg: '#dcfce7', color: '#166534', darkBg: '#14532d', darkColor: '#bbf7d0' }
    };
    const style = roleStyles[user.role] || roleStyles.CLIENT;
    return {
      backgroundColor: isDarkMode ? style.darkBg : style.bg,
      color: isDarkMode ? style.darkColor : style.color
    };
  };

  const getStatusBadgeStyle = () => {
    const statusColor = getStatusColor(user.status);
    return {
      backgroundColor: isDarkMode ? `${statusColor}30` : `${statusColor}20`,
      color: statusColor
    };
  };

  return (
    <>
      <div 
        style={{
          ...styles.card,
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--border-color)',
          boxShadow: 'var(--shadow-sm)'
        }} 
        onClick={handleCardClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = 'var(--primary-color)';
          e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'var(--border-color)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }}
      >
        <div style={{
          ...styles.cardHeader,
          borderBottomColor: 'var(--border-color)'
        }}>
          <div style={{
            ...styles.avatar,
            backgroundColor: 'var(--primary-color)'
          }}>
            {user.firstName?.[0]}{user.lastName?.[0]}
          </div>
          <div style={styles.userInfo}>
            <h3 style={{
              ...styles.userName,
              color: 'var(--text-color)'
            }}>
              {user.firstName} {user.lastName}
            </h3>
            <p style={{
              ...styles.userEmail,
              color: 'var(--text-secondary)'
            }}>
              {user.email}
            </p>
          </div>
           <button
            onClick={handleDelinquenciesClick}
            style={styles.delinquenciesButton}
            title="Просмотреть просроченные кредиты"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#e67e22'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#f39c12'}
          >
            ⚠️
          </button>
          {/* Кнопка рейтинга */}
          <button
            onClick={handleRatingClick}
            style={styles.ratingButton}
            title="Посмотреть кредитный рейтинг"
            onMouseEnter={(e) => e.target.style.backgroundColor = '#7c3aed'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#8b5cf6'}
          >
            📊
          </button>
          
          {(isActive || isBlocked) && (
            <button
              onClick={handleStatusToggle}
              disabled={isUpdating}
              style={{
                ...styles.statusButton,
                backgroundColor: buttonConfig.bgColor,
                opacity: isUpdating ? 0.5 : 1,
                cursor: isUpdating ? 'wait' : 'pointer'
              }}
              title={buttonConfig.title}
            >
              {buttonConfig.text}
            </button>
          )}
        </div>

        <div style={styles.cardBody}>
          {user.phone && (
            <div style={styles.infoRow}>
              <span style={{
                ...styles.infoLabel,
                color: 'var(--text-secondary)'
              }}>📞 Телефон:</span>
              <span style={{
                ...styles.infoValue,
                color: 'var(--text-color)'
              }}>{user.phone}</span>
            </div>
          )}
          
          <div style={styles.infoRow}>
            <span style={{
              ...styles.infoLabel,
              color: 'var(--text-secondary)'
            }}>👤 Роль:</span>
            <span style={{
              ...styles.roleBadge,
              ...getRoleBadgeStyle()
            }}>
              {getRoleLabel(user.role)}
            </span>
          </div>

          <div style={styles.infoRow}>
            <span style={{
              ...styles.infoLabel,
              color: 'var(--text-secondary)'
            }}>⚡ Статус:</span>
            <span style={{
              ...styles.statusBadge,
              ...getStatusBadgeStyle()
            }}>
              {user.status === 'ACTIVE' ? 'Активен' :
               user.status === 'INACTIVE' ? 'Неактивен' : 'Заблокирован'}
            </span>
          </div>

          <div style={styles.infoRow}>
            <span style={{
              ...styles.infoLabel,
              color: 'var(--text-secondary)'
            }}>📅 Создан:</span>
            <span style={{
              ...styles.infoValue,
              color: 'var(--text-color)'
            }}>{formatDate(user.createdAt)}</span>
          </div>
        </div>

        <div style={styles.cardFooter}>
          <span style={{
            ...styles.viewDetails,
            color: 'var(--primary-color)'
          }}>Просмотреть детали →</span>
        </div>

        {showConfirm && (
          <div style={styles.confirmOverlay} onClick={(e) => e.stopPropagation()}>
            <div style={{
              ...styles.confirmDialog,
              backgroundColor: 'var(--card-bg)',
              boxShadow: 'var(--shadow-lg)'
            }}>
              <h4 style={{
                ...styles.confirmTitle,
                color: 'var(--text-color)'
              }}>Подтверждение блокировки</h4>
              <p style={{
                ...styles.confirmText,
                color: 'var(--text-secondary)'
              }}>
                Вы уверены, что хотите заблокировать пользователя <strong>{user.firstName} {user.lastName}</strong>?
              </p>
              <div style={styles.confirmButtons}>
                <button 
                  onClick={handleCancelBlock}
                  style={{
                    ...styles.cancelButton,
                    backgroundColor: 'var(--button-bg)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-secondary)'
                  }}
                  disabled={isUpdating}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'var(--button-hover-bg)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'var(--button-bg)';
                  }}
                >
                  Отмена
                </button>
                <button 
                  onClick={handleConfirmBlock}
                  style={{
                    ...styles.confirmButton,
                    backgroundColor: '#ef4444'
                  }}
                  disabled={isUpdating}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#ef4444';
                  }}
                >
                  {isUpdating ? 'Блокировка...' : 'Заблокировать'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
 <DelinquenciesModal
        isOpen={showDelinquenciesModal}
        onClose={() => setShowDelinquenciesModal(false)}
        userId={user.id}
        userName={`${user.firstName} ${user.lastName}`}
      />
      {}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        userId={user.id}
        userName={`${user.firstName} ${user.lastName}`}
      />
      
    </>
  );
};

const styles = {
  card: {
    position: 'relative',
    borderRadius: '12px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid',
    boxShadow: 'var(--shadow-sm)'
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid'
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2em',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  userInfo: {
    flex: 1
  },
  userName: {
    margin: '0 0 5px 0',
    fontSize: '1.2em',
    fontWeight: '600'
  },
  userEmail: {
    margin: 0,
    fontSize: '0.9em'
  },
  ratingButton: {
    padding: '6px 12px',
    backgroundColor: '#8b5cf6',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontSize: '0.85em',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    marginRight: '8px'
  },
  statusButton: {
    padding: '6px 12px',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontSize: '0.85em',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    whiteSpace: 'nowrap'
  },
  cardBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '15px'
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  infoLabel: {
    minWidth: '80px',
    fontSize: '0.9em'
  },
  infoValue: {
    fontSize: '0.95em'
  },
  roleBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.85em',
    fontWeight: '500'
  },
  statusBadge: {
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '0.85em',
    fontWeight: '500'
  },
  cardFooter: {
    textAlign: 'right',
    fontSize: '0.9em',
    fontWeight: '500',
    marginTop: '10px'
  },
  viewDetails: {
    cursor: 'pointer'
  },
  confirmOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  confirmDialog: {
    padding: '25px',
    borderRadius: '12px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
  },
  confirmTitle: {
    margin: '0 0 15px 0',
    fontSize: '1.3em',
    fontWeight: '600'
  },
  confirmText: {
    margin: '0 0 20px 0',
    fontSize: '1em',
    lineHeight: '1.5'
  },
  confirmButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
  },
  cancelButton: {
    padding: '8px 16px',
    border: '1px solid',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'all 0.2s'
  },
  confirmButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'background-color 0.2s'
  }
};

export default UserCard;
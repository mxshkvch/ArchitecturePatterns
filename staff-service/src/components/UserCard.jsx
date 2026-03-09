import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserStatus } from '../services/api';

const UserCard = ({ user, formatDate, getStatusColor, getRoleLabel, onStatusChange }) => {
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Функция для проверки, является ли пользователь новым сотрудником/администратором (< 1 дня)
  const isNewEmployeeOrAdmin = useMemo(() => {
    // Проверяем, что пользователь сотрудник или администратор
    const isEmployeeOrAdmin = user.role === 'EMPLOYEE' || user.role === 'ADMIN';
    
    if (!isEmployeeOrAdmin) return false;
    
    // Проверяем, что аккаунту меньше 1 дня
    const accountCreationDate = new Date(user.createdAt);
    const now = new Date();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    
    const accountAge = now - accountCreationDate;
    return accountAge < oneDayInMs;
  }, [user.role, user.createdAt]);

  // Функция для определения, нужно ли показывать кнопки
  const shouldShowButtons = useMemo(() => {
    // Показываем кнопки если:
    // 1. Пользователь клиент (всегда)
    // 2. Или сотрудник/админ с аккаунтом младше 1 дня
    return user.role === 'CLIENT' || isNewEmployeeOrAdmin;
  }, [user.role, isNewEmployeeOrAdmin]);

  const handleCardClick = (e) => {
    if (e.target.closest('button') || e.target.closest('div[style*="confirmDialog"]')) {
      return;
    }
    navigate(`/users/${user.id}`);
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
      onStatusChange(user.id, newStatus);  
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

  // Определяем текст и стиль для кнопки в зависимости от текущего статуса
  const getButtonConfig = () => {
    if (isBlocked) {
      return {
        text: isUpdating ? '⏳' : '🔓 Разблокировать',
        bgColor: '#10b981',
        title: 'Разблокировать пользователя'
      };
    } else {
      return {
        text: isUpdating ? '⏳' : '🔒 Заблокировать',
        bgColor: '#ef4444',
        title: 'Заблокировать пользователя'
      };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div style={styles.card} onClick={handleCardClick}>
      <div style={styles.cardHeader}>
        <div style={styles.avatar}>
          {user.firstName?.[0]}{user.lastName?.[0]}
        </div>
        <div style={styles.userInfo}>
          <h3 style={styles.userName}>
            {user.firstName} {user.lastName}
          </h3>
          <p style={styles.userEmail}>{user.email}</p>
        </div>
        
        {/* Отображаем кнопку только если должныShowButtons и статус позволяет */}
        {shouldShowButtons && (isActive || isBlocked) && (
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
            <span style={styles.infoLabel}>📞 Телефон:</span>
            <span style={styles.infoValue}>{user.phone}</span>
          </div>
        )}
        
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>👤 Роль:</span>
          <span style={{
            ...styles.roleBadge,
            backgroundColor: user.role === 'ADMIN' ? '#fee2e2' : 
                           user.role === 'EMPLOYEE' ? '#dbeafe' : '#dcfce7',
            color: user.role === 'ADMIN' ? '#991b1b' : 
                   user.role === 'EMPLOYEE' ? '#1e40af' : '#166534'
          }}>
            {getRoleLabel(user.role)}
          </span>
        </div>

        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>⚡ Статус:</span>
          <span style={{
            ...styles.statusBadge,
            backgroundColor: getStatusColor(user.status) + '20',
            color: getStatusColor(user.status)
          }}>
            {user.status === 'ACTIVE' ? 'Активен' :
             user.status === 'INACTIVE' ? 'Неактивен' : 'Заблокирован'}
          </span>
        </div>

        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>📅 Создан:</span>
          <span style={styles.infoValue}>{formatDate(user.createdAt)}</span>
        </div>

        {/* Для отладки - показываем иконку для новых сотрудников/админов */}
        {isNewEmployeeOrAdmin && (
          <div style={styles.newBadge}>
            🆕 Новый сотрудник (менее 1 дня)
          </div>
        )}
      </div>

      <div style={styles.cardFooter}>
        <span style={styles.viewDetails}>Просмотреть детали →</span>
      </div>

      {/* Диалог подтверждения блокировки */}
      {showConfirm && (
        <div style={styles.confirmOverlay} onClick={(e) => e.stopPropagation()}>
          <div style={styles.confirmDialog}>
            <h4 style={styles.confirmTitle}>Подтверждение блокировки</h4>
            <p style={styles.confirmText}>
              Вы уверены, что хотите заблокировать пользователя <strong>{user.firstName} {user.lastName}</strong>?
            </p>
            <div style={styles.confirmButtons}>
              <button 
                onClick={handleCancelBlock}
                style={styles.cancelButton}
                disabled={isUpdating}
              >
                Отмена
              </button>
              <button 
                onClick={handleConfirmBlock}
                style={styles.confirmButton}
                disabled={isUpdating}
              >
                {isUpdating ? 'Блокировка...' : 'Заблокировать'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  card: {
    position: 'relative',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: '1px solid #e2e8f0',
    ':hover': {
      transform: 'translateY(-4px)',
      boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
      borderColor: '#3b82f6'
    }
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '15px',
    paddingBottom: '15px',
    borderBottom: '1px solid #e2e8f0'
  },
  avatar: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    backgroundColor: '#3b82f6',
    color: 'white',
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
    color: '#1e293b',
    fontSize: '1.2em',
    fontWeight: '600'
  },
  userEmail: {
    margin: 0,
    color: '#64748b',
    fontSize: '0.9em'
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
    whiteSpace: 'nowrap',
    ':hover:not(:disabled)': {
      opacity: 0.9
    }
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
    color: '#64748b',
    fontSize: '0.9em'
  },
  infoValue: {
    color: '#1e293b',
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
    color: '#3b82f6',
    fontSize: '0.9em',
    fontWeight: '500'
  },
  newBadge: {
    marginTop: '8px',
    padding: '4px 8px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '4px',
    fontSize: '0.8em',
    textAlign: 'center'
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
    backgroundColor: 'white',
    padding: '25px',
    borderRadius: '12px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
  },
  confirmTitle: {
    margin: '0 0 15px 0',
    color: '#1e293b',
    fontSize: '1.3em',
    fontWeight: '600'
  },
  confirmText: {
    margin: '0 0 20px 0',
    color: '#64748b',
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
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f8fafc',
      borderColor: '#94a3b8'
    }
  },
  confirmButton: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#dc2626'
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed'
    }
  }
};

export default UserCard;
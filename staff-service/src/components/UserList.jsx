import React, { useState, useEffect } from 'react';
import { getUsers } from '../services/api';
import UserCard from './UserCard';
import Pagination from './Pagination';
import RoleFilter from './RoleFilter';
import LoadingSpinner from './LoadingSpinner';
import CreateTariffModal from './CreateTariffModal';
import { createCreditTariff } from '../services/api';
import { useNavigate } from 'react-router-dom';
import CreateUserModal from './CreateUserModal';
import { createUser } from '../services/api';
import { useTheme } from '../ThemeContext';

const UserList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 5,
    totalElements: 0,
    totalPages: 0
  });
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const { isDarkMode } = useTheme(); // Получаем состояние темы

  // Добавляем эффект для отладки
  useEffect(() => {
    console.log('pageInfo изменился:', pageInfo);
  }, [pageInfo]);

  const handleUserStatusChange = (userId, newStatus) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId 
          ? { ...user, status: newStatus }
          : user
      )
    );
  };

  const handleCreateUser = async (userData) => {
    try {
      const newUser = await createUser(userData);
      alert(`Пользователь ${newUser.firstName} ${newUser.lastName} успешно создан!`);
      await loadUsers(0);
      if (selectedRole) {
        setSelectedRole('');
      }
    } catch (error) {
      throw error; 
    }
  };

  const loadUsers = async (page = 0, role = selectedRole) => {
    try {
      setLoading(true);
      console.log('Загружаем пользователей. Параметры:', { page, role, size: pageInfo.size });
      
      const data = await getUsers(page, pageInfo.size, role || undefined);
      console.log('Полученные данные от API:', data);
      
      if (data && data.content && data.page) {
        setUsers(data.content);
        
        setPageInfo({
          page: data.page.page, 
          size: data.page.size,
          totalElements: data.page.totalElements,
          totalPages: data.page.totalPages
        });
        
        console.log('Установлены пользователи:', data.content.length);
        console.log('Информация о пагинации:', {
          page: data.page.page,
          size: data.page.size,
          totalElements: data.page.totalElements,
          totalPages: data.page.totalPages
        });
      } else {
        console.warn('Неизвестный формат данных:', data);
        setUsers([]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Ошибка загрузки пользователей:', err);
      setError('Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(0);
  }, []);

  const handleRoleChange = (role) => {
    console.log('Изменение роли:', role);
    setSelectedRole(role);
    loadUsers(0, role);
  };

  const handlePageChange = (newPage) => {
    console.log('Смена страницы на:', newPage);
    loadUsers(newPage, selectedRole);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return '#2ecc71';
      case 'INACTIVE':
        return '#95a5a6';
      case 'BLOCKED':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'CLIENT':
        return 'Клиент';
      case 'EMPLOYEE':
        return 'Сотрудник';
      case 'ADMIN':
        return 'Администратор';
      default:
        return role;
    }
  };

  const handleCreateTariff = async (tariffData) => {
    try {
      const newTariff = await createCreditTariff(tariffData);
      alert(`Тариф "${newTariff.name}" успешно создан!`);
    } catch (error) {
      throw error;
    }
  };

  if (loading && users.length === 0) {
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
        <div style={styles.headerLeft}>
          <h1 style={{
            ...styles.title,
            color: 'var(--text-color)'
          }}>Управление пользователями</h1>
          <button 
            onClick={() => navigate('/credits')} 
            style={styles.creditsButton}
          >
            💳 Список кредитов
          </button>
        </div>
        <div style={styles.headerRight}>
          <button 
            onClick={() => setIsUserModalOpen(true)}  
            style={styles.createUserButton}
          >
            👤 Создать пользователя
          </button>
          <button 
            onClick={() => setIsModalOpen(true)} 
            style={styles.createRateButton}
          >
            ➕ Создать ставку
          </button>
          <div style={{
            ...styles.stats,
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-secondary)'
          }}>
            Всего пользователей: <strong style={{ color: 'var(--text-color)' }}>{pageInfo.totalElements}</strong>
          </div>
        </div>
      </div>

      <RoleFilter 
        key="role-filter"
        selectedRole={selectedRole}
        onRoleChange={handleRoleChange}
        getRoleLabel={getRoleLabel}
      />

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
          <button onClick={() => loadUsers(0)} style={styles.retryButton}>
            Попробовать снова
          </button>
        </div>
      ) : (
        <>
          {users.length === 0 ? (
            <div style={{
              ...styles.emptyContainer,
              backgroundColor: 'var(--card-bg)',
              boxShadow: 'var(--shadow)'
            }}>
              <p style={{
                ...styles.emptyText,
                color: 'var(--text-secondary)'
              }}>Пользователи не найдены</p>
            </div>
          ) : (
            <>
              <div style={styles.userGrid}>
                {users.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    formatDate={formatDate}
                    getStatusColor={getStatusColor}
                    getRoleLabel={getRoleLabel}
                    onStatusChange={handleUserStatusChange} 
                  />
                ))}
              </div>

              {/* Отображаем пагинацию только если есть несколько страниц */}
              {pageInfo.totalPages > 1 && (
                <Pagination
                  pageInfo={pageInfo}
                  onPageChange={handlePageChange}
                />
              )}
              
              {/* Для отладки показываем информацию о пагинации */}
              <div style={{
                ...styles.debugInfo,
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-secondary)'
              }}>
                Текущая страница: {pageInfo.page + 1} из {pageInfo.totalPages}, 
                Всего элементов: {pageInfo.totalElements}, 
                Элементов на странице: {pageInfo.size}
              </div>
            </>
          )}
        </>
      )}
      
      <CreateUserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        onCreateUser={handleCreateUser}
      />
      
      <CreateTariffModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateTariff={handleCreateTariff}
      />
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
    textAlign: 'center',
    borderRadius: '12px',
    transition: 'all 0.3s ease'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  title: {
    margin: 0,
    fontSize: '2em',
    fontWeight: '600',
    transition: 'color 0.3s ease'
  },
  creditsButton: {
    padding: '8px 16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#3b82f6',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'all 0.2s'
  },
  createUserButton: {
    padding: '8px 16px',
    backgroundColor: '#10b981',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'background-color 0.2s'
  },
  createRateButton: {
    padding: '8px 16px',
    backgroundColor: '#8b5cf6',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'background-color 0.2s'
  },
  stats: {
    fontSize: '1.1em',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  },
  userGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    marginTop: '20px'
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
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1em',
    fontWeight: '500',
    transition: 'background-color 0.2s'
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

// Добавляем hover эффекты через CSS-in-JS (можно добавить глобально в theme.css)
// Для кнопок добавляем динамические стили
const buttonHoverStyles = {
  creditsButton: {
    ':hover': {
      backgroundColor: '#3b82f6',
      color: 'white',
      borderColor: '#3b82f6'
    }
  },
  createUserButton: {
    ':hover': {
      backgroundColor: '#059669'
    }
  },
  createRateButton: {
    ':hover': {
      backgroundColor: '#7c3aed'
    }
  },
  retryButton: {
    ':hover': {
      backgroundColor: '#2563eb'
    }
  }
};

export default UserList;
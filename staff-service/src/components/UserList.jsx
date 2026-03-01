import React, { useState, useEffect } from 'react';
import { getUsers } from '../services/api';
import UserCard from './UserCard';
import Pagination from './Pagination';
import RoleFilter from './RoleFilter';
import LoadingSpinner from './LoadingSpinner';
import CreateTariffModal from './CreateTariffModal';
import { createCreditTariff } from '../services/api';


const UserList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0
  });

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
      const data = await getUsers(page, 20, role || undefined);
      setUsers(data.content || []);
      setPageInfo(data.page || { page: 0, size: 20, totalElements: 0, totalPages: 0 });
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить пользователей');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(0);
  }, []);

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    loadUsers(0, role);
  };

  const handlePageChange = (newPage) => {
    loadUsers(newPage);
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

  if (loading && users.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
            <h1 style={styles.title}>Управление пользователями</h1>
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

            <div style={styles.stats}>
            Всего пользователей: <strong>{pageInfo.totalElements}</strong>
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
        <div style={styles.errorContainer}>
          <p style={styles.errorText}>{error}</p>
          <button onClick={() => loadUsers(0)} style={styles.retryButton}>
            Попробовать снова
          </button>
        </div>
      ) : (
        <>
          {users.length === 0 ? (
            <div style={styles.emptyContainer}>
              <p style={styles.emptyText}>Пользователи не найдены</p>
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

              {pageInfo.totalPages > 1 && (
                <Pagination
                  pageInfo={pageInfo}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </>
      )}

      <CreateTariffModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onCreateTariff={handleCreateTariff}
/>
    </div>
    
  );
};

const handleCreateTariff = async (tariffData) => {
  try {
    const newTariff = await createCreditTariff(tariffData);
    alert(`Тариф "${newTariff.name}" успешно создан!`);
  } catch (error) {
    throw error;
  }
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
  userGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    marginTop: '20px'
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

export default UserList;
// features/users/list/UserList.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../ThemeContext';
import { useUserList } from '../hooks/useUsers';
import { UserListHeader } from './UserListHeader';
import { UserListFilters } from './UserListFilters';
import { UserCard } from '../../../entities/user/ui/UserCard';
import { PaginationControls } from '../../../shared/ui/PaginationControls'; // Изменено с Pagination на PaginationControls
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage';
import { CreateUserModal } from '../create/CreateUserModal';
import { CreateTariffModal } from '../../credits/ui/CreateTariffModal';
import { createCreditTariff } from '../../../services/api';
import { formatDate, getStatusColor, getRoleLabel } from '../../../shared/utils';

export const UserList = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isTariffModalOpen, setIsTariffModalOpen] = useState(false);
  
  const {
    users,
    loading,
    isFetching,
    error,
    pageInfo,
    selectedRole,
    handleRoleChange,
    handlePageChange,
    handleCreateUser,
    handleUpdateStatus,
    refetch,
  } = useUserList(5);
  
  const handleCreateTariff = async (tariffData) => {
    try {
      const newTariff = await createCreditTariff(tariffData);
      alert(`Тариф "${newTariff.name}" успешно создан!`);
      setIsTariffModalOpen(false);
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
      <UserListHeader
        totalElements={pageInfo.totalElements}
        onCreateUser={() => setIsUserModalOpen(true)}
        onCreateTariff={() => setIsTariffModalOpen(true)}
        onNavigateToCredits={() => navigate('/credits')}
      />
      
      <UserListFilters
        selectedRole={selectedRole}
        onRoleChange={handleRoleChange}
        getRoleLabel={getRoleLabel}
      />
      
      {error ? (
        <ErrorMessage error={error} onRetry={refetch} />
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
                    onStatusChange={handleUpdateStatus}
                    isUpdating={false}
                  />
                ))}
              </div>
              
              {pageInfo.totalPages > 1 && (
                <PaginationControls
                  pageInfo={pageInfo}
                  onPageChange={handlePageChange}
                  showInfo={true}
                />
              )}
              
              {/* Отладочная информация */}
              {process.env.NODE_ENV === 'development' && (
                <div style={{
                  ...styles.debugInfo,
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)'
                }}>
                  Текущая страница: {pageInfo.page + 1} из {pageInfo.totalPages}, 
                  Всего элементов: {pageInfo.totalElements}, 
                  Элементов на странице: {pageInfo.size}
                  {isFetching && ' (Обновление...)'}
                </div>
              )}
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
        isOpen={isTariffModalOpen}
        onClose={() => setIsTariffModalOpen(false)}
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
  userGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    marginTop: '20px'
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
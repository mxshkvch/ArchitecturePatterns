import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getUserById, getUserAccounts } from '../services/api';
import AccountCard from './AccountCard';
import LoadingSpinner from './LoadingSpinner';

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [user, setUser] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [error, setError] = useState(null);
  const [accountsError, setAccountsError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [pageInfo, setPageInfo] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0
  });

  useEffect(() => {
    loadUserData();
  }, [userId]);

  useEffect(() => {
    if (user) {
      loadAccounts(0);
    }
  }, [user, selectedStatus]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const userData = await getUserById(userId);
      setUser(userData);
      setError(null);
    } catch (err) {
      setError('Не удалось загрузить информацию о пользователе');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAccounts = async (page = 0) => {
    if (!user) return;
    
    try {
      setLoadingAccounts(true);
      const data = await getUserAccounts(userId, page, 20, selectedStatus || undefined);
      setAccounts(data.content || []);
      setPageInfo(data.page || { page: 0, size: 20, totalElements: 0, totalPages: 0 });
      setAccountsError(null);
    } catch (err) {
      setAccountsError('Не удалось загрузить счета пользователя');
      console.error(err);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  const handlePageChange = (newPage) => {
    loadAccounts(newPage);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: currency || 'RUB',
      minimumFractionDigits: 2
    }).format(amount || 0);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return '#2ecc71';
      case 'INACTIVE':
        return '#95a5a6';
      case 'BLOCKED':
        return '#e74c3c';
      case 'CLOSED':
        return '#95a5a6';
      default:
        return '#95a5a6';
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !user) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>{error || 'Пользователь не найден'}</p>
        <button onClick={() => navigate('/users')} style={styles.backButton}>
          Вернуться к списку пользователей
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/users')} style={styles.backButton}>
        ← Назад к списку пользователей
      </button>

      {/* Информация о пользователе */}
      <div style={styles.userHeader}>
        <div style={styles.avatar}>
          {user.firstName?.[0]}{user.lastName?.[0]}
        </div>
        <div style={styles.userInfo}>
          <h1 style={styles.userName}>
            {user.firstName} {user.lastName}
          </h1>
          <p style={styles.userEmail}>{user.email}</p>
          
          <div style={styles.userMeta}>
            {user.phone && (
              <span style={styles.metaItem}>📞 {user.phone}</span>
            )}
            <span style={{
              ...styles.roleBadge,
              backgroundColor: user.role === 'ADMIN' ? '#fee2e2' : 
                             user.role === 'EMPLOYEE' ? '#dbeafe' : '#dcfce7',
              color: user.role === 'ADMIN' ? '#991b1b' : 
                     user.role === 'EMPLOYEE' ? '#1e40af' : '#166534'
            }}>
              {getRoleLabel(user.role)}
            </span>
            <span style={{
              ...styles.statusBadge,
              backgroundColor: getStatusColor(user.status) + '20',
              color: getStatusColor(user.status)
            }}>
              {user.status === 'ACTIVE' ? 'Активен' :
               user.status === 'INACTIVE' ? 'Неактивен' : 'Заблокирован'}
            </span>
          </div>
          
          <p style={styles.createdAt}>
            Зарегистрирован: {formatDate(user.createdAt)}
          </p>
        </div>
      </div>

      {/* Счета пользователя */}
      <div style={styles.accountsSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Счета пользователя</h2>
          <div style={styles.totalAccounts}>
            Всего счетов: <strong>{pageInfo.totalElements}</strong>
          </div>
        </div>

        {/* Фильтр по статусу счета */}
        <div style={styles.filterContainer}>
          <span style={styles.filterLabel}>Статус счета:</span>
          <div style={styles.buttonGroup}>
            {['', 'ACTIVE', 'BLOCKED', 'CLOSED'].map((status) => (
              <button
                key={status || 'all'}
                onClick={() => handleStatusChange(status)}
                style={{
                  ...styles.filterButton,
                  ...(selectedStatus === status ? styles.filterButtonActive : {})
                }}
              >
                {status === 'ACTIVE' ? 'Активные' :
                 status === 'BLOCKED' ? 'Заблокированные' :
                 status === 'CLOSED' ? 'Закрытые' : 'Все'}
              </button>
            ))}
          </div>
        </div>

        {accountsError ? (
          <div style={styles.errorMessage}>
            <p>{accountsError}</p>
            <button onClick={() => loadAccounts(0)} style={styles.retryButton}>
              Попробовать снова
            </button>
          </div>
        ) : loadingAccounts ? (
          <div style={styles.accountsLoading}>
            <LoadingSpinner />
          </div>
        ) : accounts.length === 0 ? (
          <div style={styles.noAccounts}>
            <p>У пользователя нет счетов</p>
          </div>
        ) : (
          <>
            <div style={styles.accountsGrid}>
              {accounts.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  formatDate={formatDate}
                  formatCurrency={formatCurrency}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>

            {pageInfo.totalPages > 1 && (
              <div style={styles.pagination}>
                <button
                  onClick={() => handlePageChange(pageInfo.page - 1)}
                  disabled={pageInfo.page === 0}
                  style={styles.pageButton}
                >
                  ←
                </button>
                
                <span style={styles.pageInfo}>
                  Страница {pageInfo.page + 1} из {pageInfo.totalPages}
                </span>
                
                <button
                  onClick={() => handlePageChange(pageInfo.page + 1)}
                  disabled={pageInfo.page === pageInfo.totalPages - 1}
                  style={styles.pageButton}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>
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
  backButton: {
    padding: '10px 20px',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '0.95em',
    marginBottom: '20px',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f8fafc',
      borderColor: '#3b82f6',
      color: '#3b82f6'
    }
  },
  userHeader: {
    display: 'flex',
    gap: '30px',
    padding: '30px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    marginBottom: '30px'
  },
  avatar: {
    width: '100px',
    height: '100px',
    borderRadius: '20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2.5em',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  userInfo: {
    flex: 1
  },
  userName: {
    margin: '0 0 10px 0',
    color: '#1e293b',
    fontSize: '2.2em',
    fontWeight: '600'
  },
  userEmail: {
    margin: '0 0 15px 0',
    color: '#64748b',
    fontSize: '1.2em'
  },
  userMeta: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center',
    marginBottom: '15px',
    flexWrap: 'wrap'
  },
  metaItem: {
    color: '#64748b',
    fontSize: '1em'
  },
  roleBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.9em',
    fontWeight: '500'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '0.9em',
    fontWeight: '500'
  },
  createdAt: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '0.95em'
  },
  accountsSection: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    padding: '30px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px'
  },
  sectionTitle: {
    margin: 0,
    color: '#1e293b',
    fontSize: '1.5em',
    fontWeight: '600'
  },
  totalAccounts: {
    color: '#64748b',
    fontSize: '1.1em',
    padding: '8px 16px',
    backgroundColor: '#f1f5f9',
    borderRadius: '8px'
  },
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '25px',
    padding: '15px 20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px'
  },
  filterLabel: {
    color: '#64748b',
    fontSize: '0.95em',
    fontWeight: '500'
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap'
  },
  filterButton: {
    padding: '8px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f8fafc',
      borderColor: '#3b82f6'
    }
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6'
  },
  accountsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px'
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
  pageInfo: {
    color: '#64748b',
    fontSize: '1em'
  },
  errorContainer: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    maxWidth: '500px',
    margin: '100px auto'
  },
  errorText: {
    color: '#ef4444',
    fontSize: '1.2em',
    marginBottom: '20px'
  },
  errorMessage: {
    textAlign: 'center',
    padding: '40px',
    color: '#ef4444'
  },
  retryButton: {
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.95em',
    marginTop: '10px'
  },
  accountsLoading: {
    padding: '40px'
  },
  noAccounts: {
    textAlign: 'center',
    padding: '60px 20px',
    color: '#64748b',
    fontSize: '1.1em'
  }
};

export default UserDetail;
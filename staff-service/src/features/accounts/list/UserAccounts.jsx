import React from 'react';
import { useParams, useNavigate } from 'react-router-dom'; 
import { useAccounts } from '../hooks/useAccounts';
import { AccountCard } from '../../../entities/account/ui/AccountCard';
import { AccountsHeader } from '../ui/AccountsHeader';
import { AccountStatusFilter } from '../ui/AccountStatusFilter';
import { PaginationControls } from '../../../shared/ui/PaginationControls';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { formatDate, formatCurrency, getStatusColor } from '../../../shared/utils';

export const UserAccounts = () => {
  const { userId } = useParams(); 
  const navigate = useNavigate(); 
  
  const {
    accounts,
    loading,
    error,
    pageInfo,
    selectedStatus,
    handleStatusChange,
    handlePageChange,
    refetch,
    isEmpty
  } = useAccounts(userId, 20);

  const handleViewTransactions = (accountId) => {
    console.log('🔍 Navigating to transactions for account:', accountId);
    console.log('🔍 User ID:', userId);
    console.log('🔍 Target URL:', `/users/${userId}/accounts/${accountId}/transactions`);
    navigate(`/users/${userId}/accounts/${accountId}/transactions`);
  };

  if (loading && accounts.length === 0) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

  return (
    <div style={{
      ...styles.container,
      backgroundColor: 'var(--bg-primary)'
    }}>
      <AccountsHeader totalElements={pageInfo.totalElements} />
      
      <AccountStatusFilter 
        selectedStatus={selectedStatus} 
        onStatusChange={handleStatusChange} 
      />

      {isEmpty ? (
        <EmptyState 
          message="У пользователя нет счетов"
          icon="💳"
        />
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
                userId={userId}
                onViewTransactions={handleViewTransactions}
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
    minHeight: '100vh',
    transition: 'background-color 0.3s ease'
  },
  accountsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  }
};

export default UserAccounts;
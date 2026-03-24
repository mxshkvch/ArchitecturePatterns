import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTransactions } from '../hooks/useTransactions';
import { TransactionCard } from '../../../entities/transaction/ui/TransactionCard';
import { TransactionFilters } from '../ui/TransactionFilters';
import { TransactionDetailsModal } from '../ui/TransactionDetailsModal';
import { PaginationControls } from '../../../shared/ui/PaginationControls';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { useTheme } from '../../../ThemeContext';

export const AccountTransactions = () => {
  const { accountId, userId } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    transactions,
    loading,
    error,
    pageInfo,
    filters,
    handleFilterChange,
    handlePageChange,
    resetFilters,
    refetch,
    isEmpty
  } = useTransactions(accountId, 10);

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTransaction(null);
  };

  const handleBackToAccounts = () => {
    navigate(`/users/${userId}`);
  };

  if (loading && transactions.length === 0) {
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
      <div style={{
        ...styles.header,
        backgroundColor: 'var(--card-bg)',
        boxShadow: 'var(--shadow)'
      }}>
        <button 
          onClick={handleBackToAccounts} 
          style={styles.backButton}
        >
          ← Назад к счетам
        </button>
        
        <h1 style={{
          ...styles.title,
          color: 'var(--text-color)'
        }}>
          История операций по счету
        </h1>
        
        <div style={{
          ...styles.accountInfo,
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-secondary)'
        }}>
          Счет: <strong style={{ color: 'var(--text-color)' }}>
            {accountId?.slice(0, 8)}...
          </strong>
        </div>
      </div>

    

      {!isEmpty && (
        <div style={{
          ...styles.stats,
          backgroundColor: 'var(--card-bg)',
          boxShadow: 'var(--shadow)',
          color: 'var(--text-secondary)'
        }}>
          Найдено операций: <strong style={{ color: 'var(--text-color)' }}>
            {pageInfo.totalElements}
          </strong>
        </div>
      )}

      {isEmpty ? (
        <EmptyState 
          message="Операции по счету не найдены"
          icon="📭"
          onAction={resetFilters}
          actionText="Сбросить фильтры"
        />
      ) : (
        <>
          <div style={styles.transactionsList}>
            {transactions.map((transaction) => (
              <TransactionCard
                key={transaction.id}
                transaction={transaction}
                onClick={handleTransactionClick}
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

      <TransactionDetailsModal
        transaction={selectedTransaction}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '30px 20px',
    minHeight: '100vh',
    transition: 'background-color 0.3s ease'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '20px',
    borderRadius: '12px',
    transition: 'all 0.3s ease',
    flexWrap: 'wrap',
    gap: '15px'
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: 'var(--button-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'all 0.2s'
  },
  title: {
    margin: 0,
    fontSize: '1.5em',
    fontWeight: '600',
    transition: 'color 0.3s ease',
    textAlign: 'center'
  },
  accountInfo: {
    fontSize: '0.9em',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.3s ease'
  },
  stats: {
    marginBottom: '20px',
    padding: '15px 20px',
    borderRadius: '8px',
    fontSize: '1.1em',
    transition: 'all 0.3s ease'
  },
  transactionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '30px'
  }
};
// features/credits/list/CreditsList.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreditsList } from '../hooks/useCredits';
import { CreditCard } from '../../../entities/credit/ui/CreditCard';
import { CreditDetailsModal } from '../ui/CreditDetailsModal';
import { PaginationControls } from '../../../shared/ui/PaginationControls';
import { LoadingSpinner } from '../../../shared/ui/LoadingSpinner';
import { ErrorMessage } from '../../../shared/ui/ErrorMessage';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { useTheme } from '../../../ThemeContext';
import { formatDate, formatCurrency } from '../../../shared/utils';
import { getCreditStatusColor, getCreditStatusLabel } from '../../../shared/utils/creditUtils';

export const CreditsList = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [selectedCredit, setSelectedCredit] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    credits,
    loading,
    error,
    pageInfo,
    handlePageChange,
    refetch,
    isEmpty
  } = useCreditsList(10);

  const handleCreditClick = (credit) => {
    setSelectedCredit(credit);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCredit(null);
  };

  const handleBackToUsers = () => {
    navigate('/users');
  };

  if (loading && credits.length === 0) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={refetch} />;
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={handleBackToUsers} style={styles.backButton}>
          ← Назад к пользователям
        </button>
        <h1 style={styles.title}>Список кредитов</h1>
        <div style={styles.stats}>
          Всего кредитов: <strong>{pageInfo.totalElements}</strong>
        </div>
      </div>

      {isEmpty ? (
        <EmptyState message="Кредиты не найдены" icon="💳" />
      ) : (
        <>
          <div style={styles.creditsGrid}>
            {credits.map((credit) => (
              <CreditCard
                key={credit.id}
                credit={credit}
                onClick={handleCreditClick}
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

      <CreditDetailsModal
        credit={selectedCredit}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '30px 20px',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: 'var(--card-bg)',
    borderRadius: '12px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  backButton: {
    padding: '8px 16px',
    backgroundColor: 'var(--button-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-secondary)',
    cursor: 'pointer'
  },
  title: {
    margin: 0,
    fontSize: '1.8em',
    fontWeight: '600',
    color: 'var(--text-color)'
  },
  stats: {
    fontSize: '1.1em',
    padding: '8px 16px',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '8px',
    color: 'var(--text-secondary)'
  },
  creditsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '20px',
    marginTop: '20px'
  }
};
// shared/ui/PaginationControls.jsx
import React from 'react';

export const PaginationControls = ({ pageInfo, onPageChange, showInfo = true }) => {
  const { page, totalPages } = pageInfo;
  
  // page должен быть в 0-индексации
  const isFirstPage = page === 0;
  const isLastPage = page === totalPages - 1;

  console.log('📄 [PaginationControls] Rendering:', { 
    page, 
    totalPages, 
    isFirstPage, 
    isLastPage,
    displayPage: page + 1 
  });

  if (totalPages <= 1) return null;

  const handlePrevPage = () => {
    console.log('⬅️ [PaginationControls] Previous page clicked, current page:', page);
    if (!isFirstPage) {
      onPageChange(page - 1);
    }
  };

  const handleNextPage = () => {
    console.log('➡️ [PaginationControls] Next page clicked, current page:', page);
    if (!isLastPage) {
      onPageChange(page + 1);
    }
  };

  return (
    <div style={styles.container}>
      <button
        onClick={handlePrevPage}
        disabled={isFirstPage}
        style={{
          ...styles.button,
          opacity: isFirstPage ? 0.5 : 1,
          cursor: isFirstPage ? 'not-allowed' : 'pointer'
        }}
      >
        ← Назад
      </button>
      
      {showInfo && (
        <span style={styles.info}>
          Страница {page + 1} из {totalPages}
        </span>
      )}
      
      <button
        onClick={handleNextPage}
        disabled={isLastPage}
        style={{
          ...styles.button,
          opacity: isLastPage ? 0.5 : 1,
          cursor: isLastPage ? 'not-allowed' : 'pointer'
        }}
      >
        Вперед →
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px',
    padding: '20px',
    borderRadius: '12px',
    backgroundColor: 'var(--card-bg)',
    transition: 'all 0.3s ease'
  },
  button: {
    padding: '8px 16px',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '0.95em',
    transition: 'all 0.2s',
    backgroundColor: 'var(--button-bg)',
    color: 'var(--text-secondary)',
    cursor: 'pointer'
  },
  info: {
    fontSize: '1em',
    color: 'var(--text-secondary)'
  }
};
import React from 'react';

const Pagination = ({ pageInfo, onPageChange }) => {
  const { page, totalPages } = pageInfo;

  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= page && i <= page + delta) || (i <= page && i >= page - delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <div style={styles.pagination}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        style={styles.pageButton}
      >
        ←
      </button>

      {getPageNumbers().map((pageNum, index) => (
        <button
          key={index}
          onClick={() => typeof pageNum === 'number' && onPageChange(pageNum - 1)}
          style={{
            ...styles.pageButton,
            ...(pageNum - 1 === page ? styles.pageButtonActive : {}),
            ...(typeof pageNum !== 'number' ? styles.pageButtonDots : {})
          }}
          disabled={typeof pageNum !== 'number'}
        >
          {pageNum}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages - 1}
        style={styles.pageButton}
      >
        →
      </button>
    </div>
  );
};

const styles = {
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '8px',
    marginTop: '30px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  pageButton: {
    minWidth: '40px',
    height: '40px',
    padding: '0 8px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '0.95em',
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
  pageButtonActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6'
  },
  pageButtonDots: {
    border: 'none',
    cursor: 'default',
    ':hover': {
      backgroundColor: 'transparent',
      borderColor: 'transparent'
    }
  }
};

export default Pagination;
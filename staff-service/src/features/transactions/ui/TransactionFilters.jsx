import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { getTransactionTypeLabel, getTransactionTypeColor } from '../../../shared/utils/transactionUtils';

const TRANSACTION_TYPES = [
  { value: null, label: 'Все типы' },
  { value: 'DEPOSIT', label: 'Пополнения' },
  { value: 'WITHDRAWAL', label: 'Снятия' },
  { value: 'TRANSFER', label: 'Переводы' },
  { value: 'PAYMENT', label: 'Оплаты' },
  { value: 'REFUND', label: 'Возвраты' },
  { value: 'CREDIT_PAYMENT', label: 'Кредитные платежи' }
];

export const TransactionFilters = ({ filters, onFilterChange, onReset }) => {
  const { isDarkMode } = useTheme();
  const [showDateRange, setShowDateRange] = useState(false);

  const handleTypeChange = (type) => {
    onFilterChange({ type });
  };

  const handleDateChange = (field, value) => {
    onFilterChange({ [field]: value || null });
  };

  const handleReset = () => {
    onReset();
    setShowDateRange(false);
  };

  const hasActiveFilters = filters.type || filters.fromDate || filters.toDate;

  return (
    <div style={{
      ...styles.container,
      backgroundColor: 'var(--card-bg)',
      boxShadow: 'var(--shadow)'
    }}>
      <div style={styles.filterSection}>
        <span style={{
          ...styles.filterLabel,
          color: 'var(--text-secondary)'
        }}>
          Тип операции:
        </span>
        <div style={styles.typeButtons}>
          {TRANSACTION_TYPES.map((type) => (
            <button
              key={type.value || 'all'}
              onClick={() => handleTypeChange(type.value)}
              style={{
                ...styles.typeButton,
                backgroundColor: filters.type === type.value 
                  ? getTransactionTypeColor(type.value || 'DEPOSIT')
                  : 'var(--button-bg)',
                color: filters.type === type.value ? 'white' : 'var(--text-secondary)',
                borderColor: 'var(--border-color)'
              }}
              onMouseEnter={(e) => {
                if (filters.type !== type.value) {
                  e.target.style.backgroundColor = 'var(--button-hover-bg)';
                }
              }}
              onMouseLeave={(e) => {
                if (filters.type !== type.value) {
                  e.target.style.backgroundColor = 'var(--button-bg)';
                }
              }}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      <div style={styles.filterSection}>
        <button
          onClick={() => setShowDateRange(!showDateRange)}
          style={{
            ...styles.dateToggleButton,
            backgroundColor: showDateRange ? 'var(--primary-color)' : 'var(--button-bg)',
            color: showDateRange ? 'white' : 'var(--text-secondary)',
            borderColor: 'var(--border-color)'
          }}
        >
          📅 {showDateRange ? 'Скрыть даты' : 'Фильтр по дате'}
        </button>

        {showDateRange && (
          <div style={styles.dateRange}>
            <div style={styles.dateField}>
              <label style={{
                ...styles.dateLabel,
                color: 'var(--text-secondary)'
              }}>
                С даты:
              </label>
              <input
                type="date"
                value={filters.fromDate || ''}
                onChange={(e) => handleDateChange('fromDate', e.target.value)}
                style={{
                  ...styles.dateInput,
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)'
                }}
              />
            </div>
            <div style={styles.dateField}>
              <label style={{
                ...styles.dateLabel,
                color: 'var(--text-secondary)'
              }}>
                По дату:
              </label>
              <input
                type="date"
                value={filters.toDate || ''}
                onChange={(e) => handleDateChange('toDate', e.target.value)}
                style={{
                  ...styles.dateInput,
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-color)'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <button
          onClick={handleReset}
          style={styles.resetButton}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e8f0'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#f1f5f9'}
        >
          Сбросить фильтры
        </button>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '25px',
    padding: '20px',
    borderRadius: '12px',
    transition: 'all 0.3s ease'
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  filterLabel: {
    fontSize: '0.95em',
    fontWeight: '500',
    transition: 'color 0.3s ease'
  },
  typeButtons: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px'
  },
  typeButton: {
    padding: '8px 16px',
    border: '1px solid',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9em',
    transition: 'all 0.2s'
  },
  dateToggleButton: {
    padding: '8px 16px',
    border: '1px solid',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9em',
    width: 'fit-content',
    transition: 'all 0.2s'
  },
  dateRange: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
    marginTop: '10px'
  },
  dateField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  dateLabel: {
    fontSize: '0.85em',
    fontWeight: '500'
  },
  dateInput: {
    padding: '8px 12px',
    border: '1px solid',
    borderRadius: '6px',
    fontSize: '0.9em',
    transition: 'all 0.2s'
  },
  resetButton: {
    padding: '8px 16px',
    backgroundColor: '#f1f5f9',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9em',
    color: '#64748b',
    transition: 'all 0.2s',
    alignSelf: 'flex-start'
  }
};
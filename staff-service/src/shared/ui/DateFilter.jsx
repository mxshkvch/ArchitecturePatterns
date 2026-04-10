import React, { useState } from 'react';
import { useTheme } from '../../ThemeContext';

export const DateFilter = ({ fromDate, toDate, onDateChange, onClearFilters }) => {
  const { isDarkMode } = useTheme();
  const [localFromDate, setLocalFromDate] = useState(fromDate || '');
  const [localToDate, setLocalToDate] = useState(toDate || '');

  const handleApply = () => {
    onDateChange(localFromDate, localToDate);
  };

  const handleClear = () => {
    setLocalFromDate('');
    setLocalToDate('');
    onClearFilters();
  };

  const hasFilters = fromDate || toDate;

  return (
    <div style={{
      ...styles.container,
      backgroundColor: 'var(--card-bg)',
      boxShadow: 'var(--shadow)'
    }}>
      <div style={styles.titleSection}>
        <span style={{
          ...styles.title,
          color: 'var(--text-secondary)'
        }}>
          📅 Фильтр по дате
        </span>
        {hasFilters && (
          <button
            onClick={handleClear}
            style={styles.clearButton}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e8f0'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#f1f5f9'}
          >
            Сбросить
          </button>
        )}
      </div>
      
      <div style={styles.dateInputs}>
        <div style={styles.dateField}>
          <label style={{
            ...styles.label,
            color: 'var(--text-secondary)'
          }}>
            С даты:
          </label>
          <input
            type="date"
            value={localFromDate}
            onChange={(e) => setLocalFromDate(e.target.value)}
            style={{
              ...styles.input,
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-color)'
            }}
          />
        </div>
        
        <div style={styles.dateField}>
          <label style={{
            ...styles.label,
            color: 'var(--text-secondary)'
          }}>
            По дату:
          </label>
          <input
            type="date"
            value={localToDate}
            onChange={(e) => setLocalToDate(e.target.value)}
            style={{
              ...styles.input,
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-color)'
            }}
          />
        </div>
        
        <button
          onClick={handleApply}
          style={styles.applyButton}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary-hover)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary-color)'}
        >
          Применить
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '25px',
    transition: 'all 0.3s ease'
  },
  titleSection: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  title: {
    fontSize: '0.95em',
    fontWeight: '500'
  },
  clearButton: {
    padding: '4px 12px',
    backgroundColor: '#f1f5f9',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85em',
    color: '#64748b',
    transition: 'all 0.2s'
  },
  dateInputs: {
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-end',
    flexWrap: 'wrap'
  },
  dateField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    flex: 1,
    minWidth: '150px'
  },
  label: {
    fontSize: '0.85em',
    fontWeight: '500'
  },
  input: {
    padding: '8px 12px',
    border: '1px solid',
    borderRadius: '6px',
    fontSize: '0.9em',
    transition: 'all 0.2s'
  },
  applyButton: {
    padding: '8px 20px',
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9em',
    transition: 'background-color 0.2s',
    height: 'fit-content'
  }
};
import React from 'react';

const DateFilter = ({ fromDate, toDate, onDateChange, onClearFilters }) => {
  const handleFromDateChange = (e) => {
    onDateChange(e.target.value, toDate);
  };

  const handleToDateChange = (e) => {
    onDateChange(fromDate, e.target.value);
  };

  return (
    <div style={styles.filterContainer}>
      <div style={styles.filterTitle}>Фильтр по дате:</div>
      
      <div style={styles.dateInputs}>
        <div style={styles.inputGroup}>
          <label style={styles.inputLabel}>С</label>
          <input
            type="date"
            value={fromDate}
            onChange={handleFromDateChange}
            style={styles.dateInput}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.inputLabel}>По</label>
          <input
            type="date"
            value={toDate}
            onChange={handleToDateChange}
            style={styles.dateInput}
          />
        </div>
      </div>

      {(fromDate || toDate) && (
        <button onClick={onClearFilters} style={styles.clearButton}>
          ✕ Сбросить фильтры
        </button>
      )}
    </div>
  );
};

const styles = {
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '25px',
    padding: '15px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    flexWrap: 'wrap'
  },
  filterTitle: {
    color: '#1e293b',
    fontSize: '0.95em',
    fontWeight: '500'
  },
  dateInputs: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap'
  },
  inputGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  inputLabel: {
    color: '#64748b',
    fontSize: '0.9em'
  },
  dateInput: {
    padding: '8px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.95em',
    outline: 'none',
    transition: 'border-color 0.2s',
    ':focus': {
      borderColor: '#3b82f6'
    }
  },
  clearButton: {
    padding: '6px 12px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '0.9em',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f1f5f9',
      borderColor: '#94a3b8',
      color: '#1e293b'
    }
  }
};

export default DateFilter;
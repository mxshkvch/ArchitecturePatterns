import React, { useState } from 'react';

const CreateTariffModal = ({ isOpen, onClose, onCreateTariff }) => {
  const [formData, setFormData] = useState({
    name: '',
    interestRate: '',
    minAmount: '',
    maxAmount: '',
    minTerm: '',
    maxTerm: ''
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название тарифа обязательно';
    }

    const rate = parseFloat(formData.interestRate);
    if (!formData.interestRate) {
      newErrors.interestRate = 'Процентная ставка обязательна';
    } else if (isNaN(rate) || rate <= 0 || rate > 100) {
      newErrors.interestRate = 'Ставка должна быть числом от 0 до 100';
    }

    const minAmount = parseFloat(formData.minAmount);
    if (!formData.minAmount) {
      newErrors.minAmount = 'Минимальная сумма обязательна';
    } else if (isNaN(minAmount) || minAmount < 0) {
      newErrors.minAmount = 'Минимальная сумма должна быть положительным числом';
    }

    const maxAmount = parseFloat(formData.maxAmount);
    if (!formData.maxAmount) {
      newErrors.maxAmount = 'Максимальная сумма обязательна';
    } else if (isNaN(maxAmount) || maxAmount <= 0) {
      newErrors.maxAmount = 'Максимальная сумма должна быть положительным числом';
    } else if (maxAmount <= minAmount) {
      newErrors.maxAmount = 'Максимальная сумма должна быть больше минимальной';
    }

    const minTerm = parseInt(formData.minTerm);
    if (!formData.minTerm) {
      newErrors.minTerm = 'Минимальный срок обязателен';
    } else if (isNaN(minTerm) || minTerm < 1) {
      newErrors.minTerm = 'Минимальный срок должен быть не менее 1 месяца';
    }

    const maxTerm = parseInt(formData.maxTerm);
    if (!formData.maxTerm) {
      newErrors.maxTerm = 'Максимальный срок обязателен';
    } else if (isNaN(maxTerm) || maxTerm <= 0) {
      newErrors.maxTerm = 'Максимальный срок должен быть положительным числом';
    } else if (maxTerm <= minTerm) {
      newErrors.maxTerm = 'Максимальный срок должен быть больше минимального';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const tariffData = {
        name: formData.name.trim(),
        interestRate: parseFloat(formData.interestRate),
        minAmount: parseFloat(formData.minAmount),
        maxAmount: parseFloat(formData.maxAmount),
        minTerm: parseInt(formData.minTerm),
        maxTerm: parseInt(formData.maxTerm)
      };
      
      await onCreateTariff(tariffData);
      
      setFormData({
        name: '',
        interestRate: '',
        minAmount: '',
        maxAmount: '',
        minTerm: '',
        maxTerm: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Ошибка при создании тарифа:', error);
      setErrors({ submit: 'Не удалось создать тариф. Попробуйте позже.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Создание нового кредитного тарифа</h2>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Название тарифа *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Например: Потребительский"
              style={{
                ...styles.input,
                ...(errors.name ? styles.inputError : {})
              }}
            />
            {errors.name && <span style={styles.errorText}>{errors.name}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Процентная ставка (% в год) *</label>
            <input
              type="number"
              name="interestRate"
              value={formData.interestRate}
              onChange={handleChange}
              placeholder="Например: 15.5"
              step="0.1"
              min="0"
              max="100"
              style={{
                ...styles.input,
                ...(errors.interestRate ? styles.inputError : {})
              }}
            />
            {errors.interestRate && <span style={styles.errorText}>{errors.interestRate}</span>}
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Минимальная сумма (₽) *</label>
              <input
                type="number"
                name="minAmount"
                value={formData.minAmount}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1000"
                style={{
                  ...styles.input,
                  ...(errors.minAmount ? styles.inputError : {})
                }}
              />
              {errors.minAmount && <span style={styles.errorText}>{errors.minAmount}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Максимальная сумма (₽) *</label>
              <input
                type="number"
                name="maxAmount"
                value={formData.maxAmount}
                onChange={handleChange}
                placeholder="1000000"
                min="0"
                step="1000"
                style={{
                  ...styles.input,
                  ...(errors.maxAmount ? styles.inputError : {})
                }}
              />
              {errors.maxAmount && <span style={styles.errorText}>{errors.maxAmount}</span>}
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Минимальный срок (мес) *</label>
              <input
                type="number"
                name="minTerm"
                value={formData.minTerm}
                onChange={handleChange}
                placeholder="1"
                min="1"
                style={{
                  ...styles.input,
                  ...(errors.minTerm ? styles.inputError : {})
                }}
              />
              {errors.minTerm && <span style={styles.errorText}>{errors.minTerm}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Максимальный срок (мес) *</label>
              <input
                type="number"
                name="maxTerm"
                value={formData.maxTerm}
                onChange={handleChange}
                placeholder="60"
                min="1"
                style={{
                  ...styles.input,
                  ...(errors.maxTerm ? styles.inputError : {})
                }}
              />
              {errors.maxTerm && <span style={styles.errorText}>{errors.maxTerm}</span>}
            </div>
          </div>

          {errors.submit && (
            <div style={styles.submitError}>
              {errors.submit}
            </div>
          )}

          <div style={styles.modalFooter}>
            <button 
              type="button" 
              onClick={onClose} 
              style={styles.cancelButton}
              disabled={isSubmitting}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              style={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Создание...' : 'Создать тариф'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '30px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    paddingBottom: '15px',
    borderBottom: '2px solid #f1f5f9'
  },
  modalTitle: {
    margin: 0,
    color: '#1e293b',
    fontSize: '1.5em',
    fontWeight: '600'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '2em',
    lineHeight: 1,
    cursor: 'pointer',
    color: '#64748b',
    padding: '0 10px',
    ':hover': {
      color: '#1e293b'
    }
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  row: {
    display: 'flex',
    gap: '20px'
  },
  label: {
    color: '#1e293b',
    fontSize: '0.95em',
    fontWeight: '500'
  },
  input: {
    padding: '10px 12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1em',
    transition: 'border-color 0.2s',
    outline: 'none',
    ':focus': {
      borderColor: '#3b82f6'
    }
  },
  inputError: {
    borderColor: '#ef4444'
  },
  errorText: {
    color: '#ef4444',
    fontSize: '0.85em',
    marginTop: '4px'
  },
  submitError: {
    padding: '12px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '8px',
    fontSize: '0.95em'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '2px solid #f1f5f9'
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: 'white',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    color: '#64748b',
    fontSize: '1em',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f8fafc',
      borderColor: '#94a3b8'
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed'
    }
  },
  submitButton: {
    padding: '10px 20px',
    backgroundColor: '#8b5cf6',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1em',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#7c3aed'
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed'
    }
  }
};

export default CreateTariffModal;
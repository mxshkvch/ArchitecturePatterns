// features/credits/ui/CreateTariffModal.jsx
import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';

export const CreateTariffModal = ({ isOpen, onClose, onCreateTariff }) => {
  const { isDarkMode } = useTheme();
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
      
      // Очищаем форму
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
      setErrors({ 
        submit: error.response?.data?.message || 'Не удалось создать тариф. Попробуйте позже.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setTimeout(() => setErrors({}), 300);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div 
        style={{
          ...styles.modal,
          backgroundColor: 'var(--card-bg)'
        }} 
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          ...styles.modalHeader,
          borderBottomColor: 'var(--border-color)'
        }}>
          <h2 style={{
            ...styles.modalTitle,
            color: 'var(--text-color)'
          }}>
            Создание нового кредитного тарифа
          </h2>
          <button 
            onClick={handleClose} 
            style={{
              ...styles.closeButton,
              color: 'var(--text-secondary)'
            }}
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Название тарифа */}
          <div style={styles.formGroup}>
            <label style={{
              ...styles.label,
              color: 'var(--text-color)'
            }}>
              Название тарифа *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Например: Потребительский"
              disabled={isSubmitting}
              style={{
                ...styles.input,
                backgroundColor: 'var(--bg-secondary)',
                borderColor: errors.name ? 'var(--error-color)' : 'var(--border-color)',
                color: 'var(--text-color)'
              }}
            />
            {errors.name && <span style={styles.errorText}>{errors.name}</span>}
          </div>

          {/* Процентная ставка */}
          <div style={styles.formGroup}>
            <label style={{
              ...styles.label,
              color: 'var(--text-color)'
            }}>
              Процентная ставка (% в год) *
            </label>
            <input
              type="number"
              name="interestRate"
              value={formData.interestRate}
              onChange={handleChange}
              placeholder="Например: 15.5"
              step="0.1"
              min="0"
              max="100"
              disabled={isSubmitting}
              style={{
                ...styles.input,
                backgroundColor: 'var(--bg-secondary)',
                borderColor: errors.interestRate ? 'var(--error-color)' : 'var(--border-color)',
                color: 'var(--text-color)'
              }}
            />
            {errors.interestRate && <span style={styles.errorText}>{errors.interestRate}</span>}
          </div>

          {/* Суммы */}
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={{
                ...styles.label,
                color: 'var(--text-color)'
              }}>
                Минимальная сумма (₽) *
              </label>
              <input
                type="number"
                name="minAmount"
                value={formData.minAmount}
                onChange={handleChange}
                placeholder="0"
                min="0"
                step="1000"
                disabled={isSubmitting}
                style={{
                  ...styles.input,
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: errors.minAmount ? 'var(--error-color)' : 'var(--border-color)',
                  color: 'var(--text-color)'
                }}
              />
              {errors.minAmount && <span style={styles.errorText}>{errors.minAmount}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={{
                ...styles.label,
                color: 'var(--text-color)'
              }}>
                Максимальная сумма (₽) *
              </label>
              <input
                type="number"
                name="maxAmount"
                value={formData.maxAmount}
                onChange={handleChange}
                placeholder="1000000"
                min="0"
                step="1000"
                disabled={isSubmitting}
                style={{
                  ...styles.input,
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: errors.maxAmount ? 'var(--error-color)' : 'var(--border-color)',
                  color: 'var(--text-color)'
                }}
              />
              {errors.maxAmount && <span style={styles.errorText}>{errors.maxAmount}</span>}
            </div>
          </div>

          {/* Сроки */}
          <div style={styles.row}>
            <div style={styles.formGroup}>
              <label style={{
                ...styles.label,
                color: 'var(--text-color)'
              }}>
                Минимальный срок (мес) *
              </label>
              <input
                type="number"
                name="minTerm"
                value={formData.minTerm}
                onChange={handleChange}
                placeholder="1"
                min="1"
                disabled={isSubmitting}
                style={{
                  ...styles.input,
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: errors.minTerm ? 'var(--error-color)' : 'var(--border-color)',
                  color: 'var(--text-color)'
                }}
              />
              {errors.minTerm && <span style={styles.errorText}>{errors.minTerm}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={{
                ...styles.label,
                color: 'var(--text-color)'
              }}>
                Максимальный срок (мес) *
              </label>
              <input
                type="number"
                name="maxTerm"
                value={formData.maxTerm}
                onChange={handleChange}
                placeholder="60"
                min="1"
                disabled={isSubmitting}
                style={{
                  ...styles.input,
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: errors.maxTerm ? 'var(--error-color)' : 'var(--border-color)',
                  color: 'var(--text-color)'
                }}
              />
              {errors.maxTerm && <span style={styles.errorText}>{errors.maxTerm}</span>}
            </div>
          </div>

          {errors.submit && (
            <div style={{
              ...styles.submitError,
              backgroundColor: 'var(--error-color)20',
              color: 'var(--error-color)',
              borderColor: 'var(--error-color)'
            }}>
              {errors.submit}
            </div>
          )}

          <div style={{
            ...styles.modalFooter,
            borderTopColor: 'var(--border-color)'
          }}>
            <button 
              type="button" 
              onClick={handleClose} 
              style={{
                ...styles.cancelButton,
                backgroundColor: 'var(--button-bg)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-secondary)'
              }}
              disabled={isSubmitting}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = 'var(--button-hover-bg)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--button-bg)';
              }}
            >
              Отмена
            </button>
            <button 
              type="submit" 
              style={{
                ...styles.submitButton,
                backgroundColor: 'var(--primary-color)',
                opacity: isSubmitting ? 0.5 : 1
              }}
              disabled={isSubmitting}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.target.style.backgroundColor = 'var(--primary-hover)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'var(--primary-color)';
              }}
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
    zIndex: 1000,
    animation: 'fadeIn 0.2s ease'
  },
  modal: {
    borderRadius: '16px',
    padding: '30px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: 'var(--shadow-lg)',
    animation: 'slideIn 0.3s ease'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    paddingBottom: '15px',
    borderBottom: '2px solid'
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.5em',
    fontWeight: '600'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '2em',
    lineHeight: 1,
    cursor: 'pointer',
    padding: '0 10px',
    transition: 'color 0.2s',
    ':hover': {
      color: 'var(--error-color)'
    }
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  row: {
    display: 'flex',
    gap: '20px',
    '@media (max-width: 600px)': {
      flexDirection: 'column',
      gap: '15px'
    }
  },
  formGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    fontSize: '0.95em',
    fontWeight: '500'
  },
  input: {
    padding: '10px 12px',
    border: '2px solid',
    borderRadius: '8px',
    fontSize: '1em',
    transition: 'border-color 0.2s',
    outline: 'none',
    ':focus': {
      borderColor: 'var(--primary-color)'
    }
  },
  errorText: {
    color: 'var(--error-color)',
    fontSize: '0.85em',
    marginTop: '4px'
  },
  submitError: {
    padding: '12px',
    borderRadius: '8px',
    fontSize: '0.95em',
    textAlign: 'center',
    border: '1px solid'
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '2px solid'
  },
  cancelButton: {
    padding: '10px 20px',
    border: '2px solid',
    borderRadius: '8px',
    fontSize: '1em',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed'
    }
  },
  submitButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1em',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed'
    }
  }
};

// Добавляем анимации
if (!document.querySelector('#tariff-modal-styles')) {
  const style = document.createElement('style');
  style.id = 'tariff-modal-styles';
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;
  document.head.appendChild(style);
}

export default CreateTariffModal;
import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';

export const CreateUserModal = ({ isOpen, onClose, onCreateUser }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'CLIENT',
    password: ''
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Имя обязательно';
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = 'Имя должно содержать минимум 2 символа';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Фамилия обязательна';
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = 'Фамилия должна содержать минимум 2 символа';
    }

    if (formData.phone) {
      const phoneRegex = /^\+?[0-9]{10,15}$/;
      const cleanedPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
      if (!phoneRegex.test(cleanedPhone)) {
        newErrors.phone = 'Введите корректный номер телефона (10-15 цифр)';
      }
    }

    if (!formData.role) {
      newErrors.role = 'Роль обязательна';
    }

    if (!formData.password) {
      newErrors.password = 'Пароль обязателен';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен содержать минимум 6 символов';
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
      await onCreateUser(formData);
      
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'CLIENT',
        password: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Не удалось создать пользователя. Попробуйте позже.' 
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
            Создание нового пользователя
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
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={{
                ...styles.label,
                color: 'var(--text-color)'
              }}>
                Имя *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Введите имя"
                disabled={isSubmitting}
                style={{
                  ...styles.input,
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: errors.firstName ? 'var(--error-color)' : 'var(--border-color)',
                  color: 'var(--text-color)'
                }}
              />
              {errors.firstName && (
                <span style={styles.errorText}>{errors.firstName}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={{
                ...styles.label,
                color: 'var(--text-color)'
              }}>
                Фамилия *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Введите фамилию"
                disabled={isSubmitting}
                style={{
                  ...styles.input,
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: errors.lastName ? 'var(--error-color)' : 'var(--border-color)',
                  color: 'var(--text-color)'
                }}
              />
              {errors.lastName && (
                <span style={styles.errorText}>{errors.lastName}</span>
              )}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={{
              ...styles.label,
              color: 'var(--text-color)'
            }}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              disabled={isSubmitting}
              style={{
                ...styles.input,
                backgroundColor: 'var(--bg-secondary)',
                borderColor: errors.email ? 'var(--error-color)' : 'var(--border-color)',
                color: 'var(--text-color)'
              }}
            />
            {errors.email && (
              <span style={styles.errorText}>{errors.email}</span>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={{
              ...styles.label,
              color: 'var(--text-color)'
            }}>
              Телефон
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+7 (999) 123-45-67"
              disabled={isSubmitting}
              style={{
                ...styles.input,
                backgroundColor: 'var(--bg-secondary)',
                borderColor: errors.phone ? 'var(--error-color)' : 'var(--border-color)',
                color: 'var(--text-color)'
              }}
            />
            {errors.phone && (
              <span style={styles.errorText}>{errors.phone}</span>
            )}
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={{
                ...styles.label,
                color: 'var(--text-color)'
              }}>
                Роль *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={isSubmitting}
                style={{
                  ...styles.select,
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: errors.role ? 'var(--error-color)' : 'var(--border-color)',
                  color: 'var(--text-color)'
                }}
              >
                <option value="CLIENT">Клиент</option>
                <option value="EMPLOYEE">Сотрудник</option>
              </select>
              {errors.role && (
                <span style={styles.errorText}>{errors.role}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={{
                ...styles.label,
                color: 'var(--text-color)'
              }}>
                Пароль *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Минимум 6 символов"
                disabled={isSubmitting}
                style={{
                  ...styles.input,
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: errors.password ? 'var(--error-color)' : 'var(--border-color)',
                  color: 'var(--text-color)'
                }}
              />
              {errors.password && (
                <span style={styles.errorText}>{errors.password}</span>
              )}
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
              {isSubmitting ? 'Создание...' : 'Создать пользователя'}
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
  formRow: {
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
  select: {
    padding: '10px 12px',
    border: '2px solid',
    borderRadius: '8px',
    fontSize: '1em',
    cursor: 'pointer',
    outline: 'none',
    transition: 'border-color 0.2s',
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

if (!document.querySelector('#modal-styles')) {
  const style = document.createElement('style');
  style.id = 'modal-styles';
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

export default CreateUserModal;
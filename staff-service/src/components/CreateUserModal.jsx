import React, { useState } from 'react';

const CreateUserModal = ({ isOpen, onClose, onCreateUser }) => {
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
      if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
        newErrors.phone = 'Введите корректный номер телефона';
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
      setErrors({ submit: 'Не удалось создать пользователя. Попробуйте позже.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Создание нового пользователя</h2>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Имя *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Введите имя"
                style={{
                  ...styles.input,
                  ...(errors.firstName ? styles.inputError : {})
                }}
              />
              {errors.firstName && <span style={styles.errorText}>{errors.firstName}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Фамилия *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Введите фамилию"
                style={{
                  ...styles.input,
                  ...(errors.lastName ? styles.inputError : {})
                }}
              />
              {errors.lastName && <span style={styles.errorText}>{errors.lastName}</span>}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              style={{
                ...styles.input,
                ...(errors.email ? styles.inputError : {})
              }}
            />
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Телефон</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+7 (999) 123-45-67"
              style={{
                ...styles.input,
                ...(errors.phone ? styles.inputError : {})
              }}
            />
            {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Роль *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{
                  ...styles.select,
                  ...(errors.role ? styles.inputError : {})
                }}
              >
                <option value="CLIENT">Клиент</option>
                <option value="EMPLOYEE">Сотрудник</option>
              </select>
              {errors.role && <span style={styles.errorText}>{errors.role}</span>}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Пароль *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Минимум 6 символов"
                style={{
                  ...styles.input,
                  ...(errors.password ? styles.inputError : {})
                }}
              />
              {errors.password && <span style={styles.errorText}>{errors.password}</span>}
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
  formRow: {
    display: 'flex',
    gap: '20px'
  },
  formGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
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
  select: {
    padding: '10px 12px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1em',
    backgroundColor: 'white',
    cursor: 'pointer',
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
    backgroundColor: '#3b82f6',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '1em',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#2563eb'
    },
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed'
    }
  }
};

export default CreateUserModal;
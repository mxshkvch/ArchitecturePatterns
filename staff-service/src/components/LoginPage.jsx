import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Очищаем ошибки при вводе
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    setLoginError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email обязателен';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Введите корректный email';
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

    setIsLoading(true);
    setLoginError('');

    try {
      const response = await login(formData.email, formData.password);
      
      // Сохраняем токен (предполагаем, что ответ содержит поле token)
      // Если поле называется иначе, замените 'token' на нужное название
      const token = response.token || response.accessToken || response;
      localStorage.setItem('token', token);
      
      // Можно сохранить информацию о пользователе
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      // Перенаправляем на страницу со списком пользователей
      navigate('/users');
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      if (error.response) {
        // Обработка разных кодов ответа
        switch (error.response.status) {
          case 401:
            setLoginError('Неверный email или пароль');
            break;
          case 403:
            setLoginError('Доступ запрещен');
            break;
          case 404:
            setLoginError('Сервер не найден');
            break;
          default:
            setLoginError('Ошибка при входе в систему. Попробуйте позже.');
        }
      } else if (error.request) {
        setLoginError('Сервер не отвечает. Проверьте подключение к интернету.');
      } else {
        setLoginError('Произошла ошибка. Попробуйте снова.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <div style={styles.header}>
          <h1 style={styles.title}>Добро пожаловать</h1>
          <p style={styles.subtitle}>Войдите в систему для управления пользователями</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>📧</span>
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
                disabled={isLoading}
              />
            </div>
            {errors.email && <span style={styles.errorText}>{errors.email}</span>}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Пароль</label>
            <div style={styles.inputWrapper}>
              <span style={styles.inputIcon}>🔒</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Введите пароль"
                style={{
                  ...styles.input,
                  ...(errors.password ? styles.inputError : {})
                }}
                disabled={isLoading}
              />
            </div>
            {errors.password && <span style={styles.errorText}>{errors.password}</span>}
          </div>

          {loginError && (
            <div style={styles.loginError}>
              <span style={styles.errorIcon}>⚠️</span>
              {loginError}
            </div>
          )}

          <button 
            type="submit" 
            style={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <span style={styles.loadingSpinner}>
                <span style={styles.spinner}></span>
                Вход...
              </span>
            ) : (
              'Войти'
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={styles.footerText}>
            Демо-доступ: admin@example.com / password
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '20px'
  },
  loginBox: {
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    animation: 'fadeIn 0.5s ease'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  title: {
    margin: '0 0 10px 0',
    color: '#1e293b',
    fontSize: '2em',
    fontWeight: '600'
  },
  subtitle: {
    margin: 0,
    color: '#64748b',
    fontSize: '0.95em'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
  },
  label: {
    color: '#1e293b',
    fontSize: '0.95em',
    fontWeight: '500'
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: '#64748b',
    fontSize: '1.1em'
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '1em',
    transition: 'all 0.3s',
    outline: 'none',
    boxSizing: 'border-box',
    ':focus': {
      borderColor: '#667eea',
      boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)'
    }
  },
  inputError: {
    borderColor: '#ef4444',
    ':focus': {
      borderColor: '#ef4444'
    }
  },
  errorText: {
    color: '#ef4444',
    fontSize: '0.85em',
    marginTop: '4px'
  },
  loginError: {
    padding: '12px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '8px',
    fontSize: '0.95em',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  errorIcon: {
    fontSize: '1.1em'
  },
  submitButton: {
    padding: '12px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '1.1em',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginTop: '10px',
    ':hover:not(:disabled)': {
      backgroundColor: '#5a67d8',
      transform: 'translateY(-2px)',
      boxShadow: '0 5px 15px rgba(102, 126, 234, 0.4)'
    },
    ':active:not(:disabled)': {
      transform: 'translateY(0)'
    },
    ':disabled': {
      opacity: 0.7,
      cursor: 'not-allowed'
    }
  },
  loadingSpinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px'
  },
  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid #ffffff',
    borderTop: '3px solid transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  footer: {
    marginTop: '30px',
    textAlign: 'center',
    padding: '15px',
    backgroundColor: '#f8fafc',
    borderRadius: '10px'
  },
  footerText: {
    margin: 0,
    color: '#64748b',
    fontSize: '0.9em'
  }
};

const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);

export default LoginPage;
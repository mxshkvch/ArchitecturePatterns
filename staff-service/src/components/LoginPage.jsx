import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { jwtDecode } from 'jwt-decode'; 
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

 
  const getUserFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      console.log('Декодированный токен:', decoded);
      
      return {
        id: decoded.nameid,           
        email: decoded.email,          
        role: decoded.role,            
        
        createdAt: null // Пока null, нужно будет получить отдельно
      };
    } catch (error) {
      console.error('Ошибка при декодировании токена:', error);
      return null;
    }
  };

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
      console.log('Ответ от сервера:', response);
      
      const token = response.token;
      
      if (!token) {
        throw new Error('Токен не получен');
      }
      
      // Сохраняем токен
      localStorage.setItem('token', token);
      
      // Декодируем токен и получаем данные пользователя
      const userData = getUserFromToken(token);
      
      if (userData) {
        // Сохраняем данные пользователя (без createdAt)
        localStorage.setItem('user', JSON.stringify(userData));
        console.log('Данные пользователя сохранены:', userData);
        
        // 👇 ВАЖНО: Нам нужно получить createdAt отдельным запросом
        // Так как в токене нет даты регистрации, нужно сделать доп. запрос
        await fetchUserCreationDate(userData.id);
      }
      
      // Перенаправляем на страницу со списком пользователей
      navigate('/users');
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      if (error.response) {
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

  // 👇 Функция для получения даты регистрации пользователя
  const fetchUserCreationDate = async (userId) => {
    try {
      // Используем API для получения данных пользователя
      // Нужно создать этот метод в api.js
      const userResponse = await getUserById(userId);
      
      if (userResponse && userResponse.createdAt) {
        // Обновляем данные пользователя в localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        currentUser.createdAt = userResponse.createdAt;
        localStorage.setItem('user', JSON.stringify(currentUser));
        console.log('Дата регистрации сохранена:', userResponse.createdAt);
      }
    } catch (error) {
      console.error('Ошибка при получении даты регистрации:', error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1 className="login-title">Добро пожаловать</h1>
          <p className="login-subtitle">Войдите в систему для управления пользователями</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="user@example.com"
                className={`form-input ${errors.email ? 'error' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Введите пароль"
                className={`form-input ${errors.password ? 'error' : ''}`}
                disabled={isLoading}
              />
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {loginError && (
            <div className="login-error">
              <span className="error-icon">⚠️</span>
              {loginError}
            </div>
          )}

          <button 
            type="submit" 
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner">
                <span className="spinner"></span>
                Вход...
              </span>
            ) : (
              'Войти'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="footer-text">
            Демо-доступ: string / string
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
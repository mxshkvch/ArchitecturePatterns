
import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthCotext';
import { Button } from '../../components/ui/Button/Button';
import { Form, FormField } from '../../components/ui/Form/Form';
import './LoginPage.css';

export const LoginPage: React.FC = () => {
  const { login, loading, error: authError } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'client' | 'staff'>('client');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (data: Record<string, any>) => {
    try {
      setFormError(null);
      await login(data.email, data.password, selectedRole);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleRegisterClick = () => {
    console.log('📝 Navigating to registration page');
    navigate('/register');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Добро пожаловать в наш Банк</h1>
          <p>Войдите в свой аккаунт</p>
        </div>

        <Form
          onSubmit={handleSubmit}
          validationSchema={{
            email: (value: string) => {
              if (!value) return 'Email обязателен';
              if (!/\S+@\S+\.\S+/.test(value)) return 'Некорректный email';
              return undefined;
            },
            password: (value: string) => {
              if (!value) return 'Пароль обязателен';
              if (value.length < 6) return 'Пароль должен содержать минимум 6 символов';
              return undefined;
            },
          }}
        >
          <FormField name="email" label="Email" required>
            <input
              type="email"
              placeholder="Введите ваш email"
              autoComplete="email"
            />
          </FormField>

          <FormField name="password" label="Пароль" required>
            <input
              type="password"
              placeholder="Введите ваш пароль"
              autoComplete="current-password"
            />
          </FormField>

          <div className="role-selector">
            <label className="role-label">Я:</label>
            <div className="role-buttons">
              <button
                type="button"
                className={`role-btn ${selectedRole === 'client' ? 'active' : ''}`}
                onClick={() => setSelectedRole('client')}
              >
                <span className="role-icon">👤</span>
                <span className="role-name">Клиент</span>
                <span className="role-desc">Доступ к счетам и кредитам</span>
              </button>
              <button
                type="button"
                className={`role-btn ${selectedRole === 'staff' ? 'active' : ''}`}
                onClick={() => setSelectedRole('staff')}
              >
                <span className="role-icon">👔</span>
                <span className="role-name">Сотрудник</span>
                <span className="role-desc">Администрирование системы</span>
              </button>
            </div>
          </div>

          {(formError || authError) && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {formError || authError}
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading}
            className="login-btn"
          >
            {loading ? 'Вход...' : 'Войти'}
          </Button>

          <div className="register-link">
            <button
              type="button"
              className="link-btn"
              onClick={handleRegisterClick}
            >
              Нет аккаунта? Зарегистрироваться
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
};
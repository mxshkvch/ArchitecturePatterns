import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login(email, password);
      
      // Сохраняем токен (предполагаем, что response содержит token)
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      
      // Сохраняем данные пользователя
      if (response.user) {
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      
      // Перенаправляем на главную страницу
      navigate('/users');
    } catch (err) {
      setError('Неверный email или пароль');
      console.error('Ошибка входа:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h1 style={styles.title}>Вход в систему</h1>
        <h2 style={styles.subtitle}>Банковская система</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              required
              placeholder="Введите email"
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              required
              placeholder="Введите пароль"
            />
          </div>
          
          <button 
            type="submit" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',

    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  },
  loginBox: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '16px',
    marginLeft: '1000px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '500px',

  },
  title: {
  margin: '0 0 8px 0',
  color: '#1e293b',
  fontSize: '2em',
  fontWeight: '600',
  textAlign: 'center'  
},
  subtitle: {
    margin: '0 0 30px 0',
    color: '#64748b',
    fontSize: '1.1em',
    textAlign: 'center',
    fontWeight: '400'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    color: '#1e293b',
    fontSize: '0.95em',
    fontWeight: '500'
  },
  input: {
    padding: '12px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1em',
    transition: 'border-color 0.2s',
    outline: 'none',
    ':focus': {
      borderColor: '#3b82f6'
    }
  },
  button: {
    padding: '14px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1em',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: '10px',
    ':hover': {
      backgroundColor: '#2563eb'
    },
    ':disabled': {
      backgroundColor: '#94a3b8',
      cursor: 'not-allowed'
    }
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#ef4444',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    fontSize: '0.95em'
  }
};

export default Login;
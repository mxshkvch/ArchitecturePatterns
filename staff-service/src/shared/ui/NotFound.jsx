import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>404</h1>
        <p style={styles.message}>Страница не найдена</p>
        <p style={styles.description}>
          Извините, запрашиваемая страница не существует или была перемещена.
        </p>
        <button
          onClick={() => navigate('/users')}
          style={styles.button}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--primary-hover)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--primary-color)'}
        >
          Вернуться на главную
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 120px)',
    padding: '20px'
  },
  content: {
    textAlign: 'center',
    maxWidth: '500px'
  },
  title: {
    fontSize: '120px',
    fontWeight: 'bold',
    margin: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  message: {
    fontSize: '24px',
    margin: '20px 0 10px',
    color: 'var(--text-color)'
  },
  description: {
    fontSize: '16px',
    color: 'var(--text-secondary)',
    marginBottom: '30px'
  },
  button: {
    padding: '12px 24px',
    backgroundColor: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.2s'
  }
};
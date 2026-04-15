import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated, authService } from '../../../services/api/auth/authService';
import { useTheme } from '../../../ThemeContext';
import { useUserPermissions } from '../../users/hooks/useUserPermissions';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme, loading: themeLoading } = useTheme();
  const authenticated = isAuthenticated();
  
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userName = currentUser?.firstName && currentUser?.lastName 
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : currentUser?.email || 'Пользователь';

  const handleLogout = () => {
    authService.logout();
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  const handleOpenMetrics = () => {
    // Открываем страницу с метриками в новом окне/вкладке
    window.open('http://localhost:5177/metrics', '_blank');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!authenticated) return null;

  return (
    <header className="app-header" style={styles.header}>
      <div className="logo" style={styles.logo}>
        <span style={styles.logoIcon}>🏦</span>
        <span style={styles.logoText}>Bank System</span>
      </div>

      <div style={styles.navButtons}>
        <button
          onClick={() => handleNavigate('/users')}
          style={{
            ...styles.navButton,
            ...(isActive('/users') && styles.activeButton),
            backgroundColor: isActive('/users') ? 'var(--primary-color)' : 'transparent',
            color: isActive('/users') ? 'white' : 'var(--text-color)'
          }}
          onMouseEnter={(e) => {
            if (!isActive('/users')) {
              e.target.style.backgroundColor = 'var(--button-hover-bg)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive('/users')) {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          👥 Пользователи
        </button>

        <button
          onClick={() => handleNavigate('/credits')}
          style={{
            ...styles.navButton,
            ...(isActive('/credits') && styles.activeButton),
            backgroundColor: isActive('/credits') ? 'var(--primary-color)' : 'transparent',
            color: isActive('/credits') ? 'white' : 'var(--text-color)'
          }}
          onMouseEnter={(e) => {
            if (!isActive('/credits')) {
              e.target.style.backgroundColor = 'var(--button-hover-bg)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive('/credits')) {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          💳 Кредиты
        </button>

        <button
          onClick={() => handleNavigate('/master-account')}
          style={{
            ...styles.navButton,
            ...styles.masterAccountButton,
            ...(isActive('/master-account') && styles.activeButton),
            backgroundColor: isActive('/master-account') ? 'var(--primary-color)' : 'transparent',
            color: isActive('/master-account') ? 'white' : 'var(--text-color)'
          }}
          onMouseEnter={(e) => {
            if (!isActive('/master-account')) {
              e.target.style.backgroundColor = 'var(--button-hover-bg)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive('/master-account')) {
              e.target.style.backgroundColor = 'transparent';
            }
          }}
        >
          🏦 Мастер-счет
        </button>

        {/* Новая кнопка для метрик */}
        <button
          onClick={handleOpenMetrics}
          style={{
            ...styles.navButton,
            ...styles.metricsButton,
            backgroundColor: 'transparent',
            color: 'var(--text-color)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'var(--button-hover-bg)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          📊 Метрики
        </button>

        <div style={styles.userInfo}>
          <span style={styles.userName}>👤 {userName}</span>
        </div>

        <button
          onClick={toggleTheme}
          style={styles.themeButton}
          disabled={themeLoading}
          onMouseEnter={(e) => {
            if (!themeLoading) {
              e.target.style.backgroundColor = 'var(--button-hover-bg)';
            }
          }}
          onMouseLeave={(e) => {
            if (!themeLoading) {
              e.target.style.backgroundColor = 'var(--button-bg)';
            }
          }}
        >
          {themeLoading ? '⏳' : (isDarkMode ? '☀️' : '🌙')}
          <span style={styles.themeText}>
            {themeLoading ? 'Загрузка...' : (isDarkMode ? 'Светлая' : 'Темная')}
          </span>
        </button>

        <button
          onClick={handleLogout}
          style={styles.logoutButton}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#dc2626';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#ef4444';
          }}
        >
          🚪 Выйти
        </button>
      </div>
    </header>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 20px',
    backgroundColor: 'var(--card-bg)',
    borderBottom: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    transition: 'all 0.3s ease'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '20px',
    fontWeight: 'bold'
  },
  logoIcon: {
    fontSize: '24px'
  },
  logoText: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  navButtons: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  navButton: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    backgroundColor: 'transparent'
  },
  activeButton: {
    backgroundColor: 'var(--primary-color)',
    color: 'white'
  },
  masterAccountButton: {
  },
  metricsButton: {
    // Специальный стиль для кнопки метрик
    border: '1px solid var(--primary-color)',
  },
  userInfo: {
    padding: '0 10px',
    borderLeft: '1px solid var(--border-color)',
    marginLeft: '5px'
  },
  userName: {
    fontSize: '14px',
    color: 'var(--text-secondary)'
  },
  themeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: 'var(--button-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s',
    color: 'var(--text-color)'
  },
  themeText: {
    fontSize: '13px'
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.2s'
  }
};
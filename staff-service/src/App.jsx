// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import UserList from './components/UserList';
import CreditsList from './components/CreditsList';
import AccountTransactions from './components/AccountTransactions';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { isAuthenticated, logout } from './services/api';

// Компонент шапки с кнопкой выхода
const Header = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();

  const handleLogout = () => {
    logout(); // Удаляем токен из localStorage
    navigate('/login'); // Перенаправляем на страницу входа
  };

  if (!authenticated) return null; // Не показываем шапку, если пользователь не авторизован

  return (
    <header style={styles.header}>
      <div style={styles.logo}>Bank System</div>
      <div style={styles.navButtons}>
        <button 
          onClick={() => navigate('/users')} 
          style={styles.navButton}
        >
          👥 Пользователи
        </button>
        <button 
          onClick={() => navigate('/credits')} 
          style={styles.navButton}
        >
          💳 Кредиты
        </button>
        <button 
          onClick={handleLogout} 
          style={styles.logoutButton}
        >
          🚪 Выйти
        </button>
      </div>
    </header>
  );
};

function App() {
  return (
    <BrowserRouter>
      <Header /> {/* 👈 Добавляем шапку с кнопкой выхода */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/users" element={
          <ProtectedRoute>
            <UserList />
          </ProtectedRoute>
        } />
        <Route path="/credits" element={
          <ProtectedRoute>
            <CreditsList />
          </ProtectedRoute>
        } />
        <Route path="/users/:userId" element={
          <ProtectedRoute>
            <UserList />
          </ProtectedRoute>
        } />
        <Route path="/users/:userId/accounts/:accountId/transactions" element={
          <ProtectedRoute>
            <AccountTransactions />
          </ProtectedRoute>
        } />
        <Route path="/" element={<Navigate to="/users" />} />
      </Routes>
    </BrowserRouter>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 30px',
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 1000
  },
  logo: {
    fontSize: '1.5em',
    fontWeight: 'bold',
    color: '#3b82f6'
  },
  navButtons: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  navButton: {
    padding: '8px 16px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'all 0.2s',
    ':hover': {
      backgroundColor: '#f1f5f9',
      borderColor: '#3b82f6',
      color: '#3b82f6'
    }
  },
  logoutButton: {
    padding: '8px 16px',
    backgroundColor: '#ef4444',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.95em',
    transition: 'background-color 0.2s',
    ':hover': {
      backgroundColor: '#dc2626'
    }
  }
};

export default App;
// App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import UserList from './components/UserList';
import CreditsList from './components/CreditsList';
import UserDetails from './components/UserDetail';
import MasterAccount from './components/MasterAccount'; 
import AccountTransactions from './components/AccountTransactions';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { isAuthenticated, logout } from './services/api';
import { useTheme } from './ThemeContext';
import './theme.css';

const Header = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const { isDarkMode, toggleTheme, loading } = useTheme();

  const handleLogout = () => {
    logout(); 
    navigate('/login');
  };

  if (!authenticated) return null;

  return (
    <header className="app-header">
      <div className="logo">Bank System</div>
      <div className="nav-buttons">
        <button 
          onClick={() => navigate('/users')} 
          className="nav-button"
        >
          👥 Пользователи
        </button>
        <button 
          onClick={() => navigate('/credits')} 
          className="nav-button"
        >
          💳 Кредиты
        </button>
        <button 
          onClick={() => navigate('/master-account')}
          className="master-account-button"
        >
          🏦 Мастер-счет
        </button>
        <button 
          onClick={toggleTheme}
          className="theme-button"
          disabled={loading}
        >
          {loading ? '⏳' : (isDarkMode ? '☀️ Светлая' : '🌙 Темная')}
        </button>
        <button 
          onClick={handleLogout} 
          className="logout-button"
        >
          🚪 Выйти
        </button>
      </div>
    </header>
  );
};

function App() {
  const { loading } = useTheme();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Загрузка настроек...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Header />
      <div className="app-content">
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
          <Route path="/master-account" element={  
            <ProtectedRoute>
              <MasterAccount />
            </ProtectedRoute>
          } />
          <Route path="/users/:userId" element={
            <ProtectedRoute>
              <UserDetails />
            </ProtectedRoute>
          } />
          <Route path="/users/:userId/accounts/:accountId/transactions" element={
            <ProtectedRoute>
              <AccountTransactions />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/users" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
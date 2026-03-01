import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import UserList from './components/UserList';
import UserDetail from './components/UserDetail';
import CreditsList from './components/CreditsList';
import AccountTransactions from './components/AccountTransactions';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {}
        <Route path="/login" element={<LoginPage />} />
        
        {}
        <Route path="/" element={
          <ProtectedRoute>
            <Navigate to="/users" replace />
          </ProtectedRoute>
        } />
        
        <Route path="/users" element={
          <ProtectedRoute>
            <UserList />
          </ProtectedRoute>
        } />
        
        <Route path="/users/:userId" element={
          <ProtectedRoute>
            <UserDetail />
          </ProtectedRoute>
        } />
        
        <Route path="/credits" element={
          <ProtectedRoute>
            <CreditsList />
          </ProtectedRoute>
        } />
        
        <Route path="/users/:userId/accounts/:accountId/transactions" element={
          <ProtectedRoute>
            <AccountTransactions />
          </ProtectedRoute>
        } />
        
        {}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
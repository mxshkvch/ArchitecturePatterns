// src/App.tsx
import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthCotext';
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { LoginPage } from './pages/LoginPage/LoginPage';
import { NotificationContainer } from './components/ui/Notification/Notification';
import { initializeDI } from './core/di/container';
import './App.css';

// Initialize DI before rendering
initializeDI();

// Ленивая загрузка микрофронтендов


const LoadingFallback: React.FC = () => (
  <div className="loading-screen">
    <div className="spinner" />
    <p>Loading...</p>
  </div>
);

const AppRoutes: React.FC = () => {
  const { userRole, loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      
      <Route element={<ProtectedRoute allowedRoles={['client']} />}>
        <Route
          path="/client/*"
          element={
            <React.Suspense fallback={<LoadingFallback />}>
              {/* <ClientApp /> */}
            </React.Suspense>
          }
        />
      </Route>
      
      <Route element={<ProtectedRoute allowedRoles={['staff', 'admin']} />}>
        <Route
          path="/staff/*"
          element={
            <React.Suspense fallback={<LoadingFallback />}>
              {/* <StaffApp /> */}
            </React.Suspense>
          }
        />
      </Route>
      
      <Route
        path="/"
        element={
          <Navigate
            to={
              userRole === 'client'
                ? '/client'
                : userRole === 'staff' || userRole === 'admin'
                ? '/staff'
                : '/login'
            }
            replace
          />
        }
      />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <React.StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <div className="app">
            <NotificationContainer />
            <AppRoutes />
          </div>
        </AuthProvider>
      </BrowserRouter>
    </React.StrictMode>
  );
};

export default App;
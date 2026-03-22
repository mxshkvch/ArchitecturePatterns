// src/components/ProtectedRoute/ProtectedRoute.tsx
import * as React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthCotext';

interface ProtectedRouteProps {
  allowedRoles?: ('client' | 'staff' | 'admin')[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles = [],
  redirectTo = '/login',
}) => {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (allowedRoles.length > 0 && userRole && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate dashboard based on role
    const redirect = userRole === 'client' ? '/client' : '/staff';
    return <Navigate to={redirect} replace />;
  }

  return <Outlet />;
};
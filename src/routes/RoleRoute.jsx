import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { LoadingState } from '@/components/ui/LoadingState';

export function RoleRoute({ allowedRole, children }) {
  const { role, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-creamLight">
        <LoadingState message="Checking permissions..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role !== allowedRole) {
    // Prevent unauthorized cross-role access:
    // If Owner tries to access customer route -> redirect to Owner dashboard
    // If Customer tries to access owner route -> redirect to Customer dashboard
    if (role === 'OWNER') {
      return <Navigate to="/owner/dashboard" replace />;
    }
    if (role === 'CUSTOMER') {
      return <Navigate to="/customer/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
}

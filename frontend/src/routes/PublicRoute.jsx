import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../config/routes';
import AuthSplash from './AuthSplash';

export default function PublicRoute({ children }) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();

  if (initializing) return <AuthSplash />;

  if (isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || ROUTES.DASHBOARD;
    return <Navigate to={redirectTo} replace />;
  }

  return children ? children : <Outlet />;
}

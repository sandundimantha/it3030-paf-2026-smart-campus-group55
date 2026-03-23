import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Protects any routes that require authentication.
 * If no JWT token is found in local storage, the user is 
 * redirected to the login page automatically.
 */
export default function PrivateRoute() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

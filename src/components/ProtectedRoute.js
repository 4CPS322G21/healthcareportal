import React from 'react';
import { Navigate } from 'react-router-dom';

// Usage: <ProtectedRoute><Component /></ProtectedRoute>

function ProtectedRoute({ children }) {
  // Allow if any valid session key is present
  const token = localStorage.getItem('token');
  const nurse = localStorage.getItem('nurse_email');
  const admin = localStorage.getItem('admin_email');
  const patient = localStorage.getItem('patient_email');
  if (token || nurse || admin || patient) {
    return children;
  }
  // Redirect to appropriate login page based on path
  const path = window.location.pathname;
  if (path.startsWith('/nurse')) return <Navigate to="/nurse/login" replace />;
  if (path.startsWith('/admin')) return <Navigate to="/admin/login" replace />;
  if (path.startsWith('/patient')) return <Navigate to="/patient/login" replace />;
  return <Navigate to="/login" replace />;
}

export default ProtectedRoute;

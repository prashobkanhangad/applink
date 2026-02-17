import React from 'react';
import { handleAuthFailure } from '../services/authService';

/**
 * Protects routes that require authentication.
 * Redirects to signup with message if no auth token is present.
 */
export const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');

  if (!token) {
    handleAuthFailure('Please sign in to access this page.');
    return null;
  }

  return children;
};

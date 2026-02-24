import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthFailure, getCurrentUser } from '../services/authService';

/**
 * Protects admin routes: only users with userType === 'admin' can access.
 * - No token → redirect to signup.
 * - Token but not admin → redirect to /dashboard.
 * Uses localStorage user first; if userType missing, fetches /auth/me.
 */
export const AdminRoute = ({ children }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // 'checking' | 'allowed' | 'denied'

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      handleAuthFailure('Please sign in to access the admin area.');
      return;
    }

    const userJson = localStorage.getItem('user');
    const localUser = userJson ? JSON.parse(userJson) : null;
    const localType = localUser?.userType || localUser?.role;

    if (localType === 'admin') {
      setStatus('allowed');
      return;
    }

    getCurrentUser()
      .then((result) => {
        const userType = result?.userType || result?.user?.userType || result?.user?.role;
        if (userType === 'admin') {
          setStatus('allowed');
        } else {
          setStatus('denied');
          navigate('/dashboard', { replace: true });
        }
      })
      .catch(() => {
        setStatus('denied');
        navigate('/dashboard', { replace: true });
      });
  }, [navigate]);

  if (status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-muted-foreground">Checking access...</p>
        </div>
      </div>
    );
  }

  if (status === 'denied') {
    return null;
  }

  return children;
};

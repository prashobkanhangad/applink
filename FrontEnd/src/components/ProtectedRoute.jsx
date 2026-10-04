import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { handleAuthFailure, getCurrentUser } from '../services/authService';

/**
 * Protects routes that require authentication.
 * Redirects to signup if no token; redirects to onboarding if profile incomplete.
 */
export const ProtectedRoute = ({ children }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  const [checking, setChecking] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    if (!token) {
      handleAuthFailure('Please sign in to access this page.');
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const current = await getCurrentUser();
        if (!cancelled) {
          setNeedsOnboarding(!!(current?.needsOnboarding || current?.user?.needsOnboarding));
        }
      } catch {
        // getCurrentUser already handles 401 redirect
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token) {
    return null;
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-2 border-foreground border-t-transparent rounded-full" />
      </div>
    );
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
};

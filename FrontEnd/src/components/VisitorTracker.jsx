import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../services/visitorTracking';

/**
 * Records public-page visits for the admin traffic dashboard.
 * Skips /admin and /dashboard internally.
 */
export const VisitorTracker = () => {
  const location = useLocation();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      trackPageView(location.pathname);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [location.pathname]);

  return null;
};

export default VisitorTracker;

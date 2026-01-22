import React from 'react';
import { useLocation } from 'react-router-dom';
import { Overview } from './dashboard/Overview';
import { Team } from './dashboard/Team';
import { Links } from './dashboard/Links';
import { Analytics } from './dashboard/Analytics';
import { Keys } from './dashboard/Keys';
import { Pricing } from './dashboard/Pricing';
import { Profile } from './dashboard/Profile';
import { Settings } from './dashboard/Settings';
import { LinkAnalytics } from './dashboard/LinkAnalytics';

/**
 * Dashboard Router Component
 * Routes to different dashboard pages based on URL
 */
export const Dashboard = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Check if this is a link analytics page (e.g., /dashboard/links/123)
  if (pathSegments.length === 3 && pathSegments[1] === 'links' && pathSegments[2] !== 'create' && pathSegments[2] !== 'edit') {
    return <LinkAnalytics />;
  }
  
  const path = pathSegments[1] || 'main';

  switch (path) {
    case 'team':
      return <Team />;
    case 'links':
      return <Links />;
    case 'analytics':
      return <Analytics />;
    case 'keys':
      return <Keys />;
    case 'pricing':
      return <Pricing />;
    case 'profile':
      return <Profile />;
    case 'settings':
      return <Settings />;
    case 'main':
    default:
      return <Overview />;
  }
};

export default Dashboard;

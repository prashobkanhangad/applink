import React from 'react';
import { useLocation } from 'react-router-dom';
import { Overview } from './dashboard/Overview';
import { Team } from './dashboard/Team';
import { Links } from './dashboard/Links';
import { Analytics } from './dashboard/Analytics';
import { Keys } from './dashboard/Keys';
import { Pricing } from './dashboard/Pricing';

/**
 * Dashboard Router Component
 * Routes to different dashboard pages based on URL
 */
export const Dashboard = () => {
  const location = useLocation();
  const path = location.pathname.split('/')[2] || 'main';

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
    case 'main':
    default:
      return <Overview />;
  }
};

export default Dashboard;

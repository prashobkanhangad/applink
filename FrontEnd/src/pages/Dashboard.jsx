import React from 'react';
import { useLocation } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { Overview } from './dashboard/Overview';
import { Team } from './dashboard/Team';
import { Links } from './dashboard/Links';
import { Analytics } from './dashboard/Analytics';
import { Keys } from './dashboard/Keys';
import { Pricing } from './dashboard/Pricing';
import { Profile } from './dashboard/Profile';
import { Settings } from './dashboard/Settings';
import { LinkAnalytics } from './dashboard/LinkAnalytics';

const META = {
  title: 'Dashboard',
  description: 'Manage your DeepLink apps, links, analytics, and team. Deep linking and attribution dashboard.',
};

/**
 * Dashboard Router Component
 * Routes to different dashboard pages based on URL
 */
export const Dashboard = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  // Check if this is a link analytics page (e.g., /dashboard/links/123)
  if (pathSegments.length === 3 && pathSegments[1] === 'links' && pathSegments[2] !== 'create' && pathSegments[2] !== 'edit') {
    return (
      <>
        <PageMeta title={META.title} description={META.description} path={location.pathname} noIndex />
        <LinkAnalytics />
      </>
    );
  }

  const path = pathSegments[1] || 'main';
  const dashboardMeta = <PageMeta title={META.title} description={META.description} path={location.pathname} noIndex />;

  switch (path) {
    case 'team':
      return <>{dashboardMeta}<Team /></>;
    case 'links':
      return <>{dashboardMeta}<Links /></>;
    case 'analytics':
      return <>{dashboardMeta}<Analytics /></>;
    case 'keys':
      return <>{dashboardMeta}<Keys /></>;
    case 'pricing':
      return <>{dashboardMeta}<Pricing /></>;
    case 'profile':
      return <>{dashboardMeta}<Profile /></>;
    case 'settings':
      return <>{dashboardMeta}<Settings /></>;
    case 'main':
    default:
      return <>{dashboardMeta}<Overview /></>;
  }
};

export default Dashboard;

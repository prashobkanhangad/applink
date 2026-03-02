import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signOut } from '../services/authService';
import { ChatSocketProvider } from '@/contexts/ChatSocketContext';

/**
 * Admin dashboard layout with sidebar navigation.
 * Use for routes under /admin.
 */
export const AdminLayout = ({ children, title = 'Admin', subtitle = 'Overview' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const getActiveNav = () => {
    if (location.pathname === '/admin') return 'overview';
    const path = location.pathname.split('/')[2];
    return path || 'overview';
  };

  const activeNav = getActiveNav();
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: OverviewIcon, path: '/admin' },
    { id: 'users', label: 'Users', icon: UsersIcon, path: '/admin/users' },
    { id: 'apps', label: 'Apps', icon: AppsIcon, path: '/admin/apps' },
    { id: 'links', label: 'Links', icon: LinksIcon, path: '/admin/links' },
    { id: 'support', label: 'Support', icon: ChatIcon, path: '/admin/support' },
    { id: 'affiliates', label: 'Affiliates', icon: AffiliatesIcon, path: '/admin/affiliates' },
    { id: 'pricing', label: 'Pricing', icon: PricingIcon, path: '/admin/pricing' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/admin/settings' },
  ];

  const handleNavClick = (item) => {
    navigate(item.path);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleSignOut = () => {
    try {
      signOut();
      navigate('/signup');
    } catch (e) {
      navigate('/signup');
    }
  };

  return (
    <ChatSocketProvider>
    <div className="min-h-screen flex bg-background relative overflow-hidden link-pattern">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/5 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(200_85%_50%)]/5 blur-[100px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={toggleSidebar} />
      )}

      <aside className={`${isSidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:translate-x-0 lg:w-16'} fixed lg:relative inset-y-0 left-0 bg-black border-r border-gray-800 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out z-50 lg:z-auto overflow-hidden`}>
        <div className={`h-16 ${isSidebarOpen ? 'px-6' : 'px-4'} flex items-center justify-between border-b border-gray-800`}>
          {isSidebarOpen && (
            <div className="flex items-center gap-2">
              <img src="/logo_light.png" alt="Deeplink" className="h-10 w-auto object-contain" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Admin</span>
            </div>
          )}
          {!isSidebarOpen && (
            <img src="/logo_light.png" alt="Deeplink" className="h-10 w-auto object-contain mx-auto" />
          )}
          {isSidebarOpen && (
            <button onClick={toggleSidebar} className="lg:hidden p-1 rounded hover:bg-gray-800" aria-label="Close sidebar">
              <CloseIcon className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        <nav className={`flex-1 ${isSidebarOpen ? 'px-4' : 'px-2'} py-4 space-y-1 overflow-y-auto`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-3' : 'justify-center px-2'} py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive ? 'bg-white text-black' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-black' : 'text-gray-500'}`} />
                {isSidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 space-y-2">
          <button
            onClick={() => navigate('/dashboard')}
            className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-3' : 'justify-center px-2'} py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-all`}
            title={!isSidebarOpen ? 'Dashboard' : undefined}
          >
            <DashboardIcon className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="truncate">Back to Dashboard</span>}
          </button>
          <button
            onClick={handleSignOut}
            className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-3' : 'justify-center px-2'} py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-all`}
            title={!isSidebarOpen ? 'Sign Out' : undefined}
          >
            <LogoutIcon className="w-5 h-5 flex-shrink-0" />
            {isSidebarOpen && <span className="truncate">Sign Out</span>}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 w-full lg:w-auto relative z-10">
        <header className="sticky top-0 z-30 h-20 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors flex-shrink-0"
              aria-label="Toggle sidebar"
            >
              {isSidebarOpen ? <ArrowLeftIcon className="w-5 h-5 text-gray-700" /> : <ArrowRightIcon className="w-5 h-5 text-gray-700" />}
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">{title}</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">{subtitle}</p>
            </div>
          </div>
        </header>

        {children}

        <footer className="mt-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-gray-600">©2026 Deeplink.in — Admin</p>
            <a href="https://docs.deeplink.in/" target="_blank" rel="noopener noreferrer" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900">Docs</a>
          </div>
        </footer>
      </div>
    </div>
    </ChatSocketProvider>
  );
};

const OverviewIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);
const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);
const AppsIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
);
const LinksIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);
const AffiliatesIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);
const SettingsIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const PricingIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ChatIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);
const DashboardIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);
const ArrowLeftIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);
const ArrowRightIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);
const CloseIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const LogoutIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

export default AdminLayout;

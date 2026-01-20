import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Dashboard Layout Component
 * Shared layout with sidebar navigation for all dashboard pages
 */

export const DashboardLayout = ({ children, title = 'Overview', subtitle = 'Home' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const getActiveNav = () => {
    if (location.pathname === '/dashboard') return 'main';
    const path = location.pathname.split('/')[2];
    return path || 'main';
  };

  const activeNav = getActiveNav();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { id: 'main', label: 'Main', icon: MainIcon, path: '/dashboard' },
    { id: 'team', label: 'Team', icon: TeamIcon, path: '/dashboard/team' },
    { id: 'links', label: 'Links', icon: LinksIcon, path: '/dashboard/links' },
    { id: 'analytics', label: 'Analytics', icon: AnalyticsIcon, path: '/dashboard/analytics' },
    { id: 'keys', label: 'Keys', icon: KeysIcon, path: '/dashboard/keys' },
    { id: 'pricing', label: 'Pricing', icon: PricingIcon, path: '/dashboard/pricing' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/dashboard/settings' },
  ];

  const handleNavClick = (item) => {
    navigate(item.path);
  };

  return (
    <div className="min-h-screen flex bg-white relative">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      
      {/* Dark Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0 lg:w-16'} fixed lg:relative inset-y-0 left-0 bg-gray-800 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out z-50 lg:z-auto`}>
        {/* Logo */}
        <div className={`h-16 ${isSidebarOpen ? 'px-6' : 'px-4'} flex items-center justify-between border-b border-gray-700 ${!isSidebarOpen ? 'lg:flex' : ''}`}>
          {isSidebarOpen && (
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-lg">C</span>
            </div>
          )}
          {!isSidebarOpen && (
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mx-auto">
              <span className="text-white font-semibold text-lg">C</span>
            </div>
          )}
          {/* Close button for mobile */}
          {isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-1 rounded hover:bg-gray-700"
              aria-label="Close sidebar"
            >
              <CloseIcon className="w-5 h-5 text-gray-300" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${isSidebarOpen ? 'px-4' : 'px-2'} py-4 space-y-1 overflow-y-auto ${!isSidebarOpen ? 'lg:block hidden' : ''}`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  handleNavClick(item);
                  // Close sidebar on mobile after navigation
                  if (window.innerWidth < 1024) {
                    setIsSidebarOpen(false);
                  }
                }}
                className={`w-full flex items-center ${isSidebarOpen ? 'gap-3 px-3' : 'justify-center px-2'} py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
                title={!isSidebarOpen ? item.label : undefined}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                {isSidebarOpen && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Icons */}
        <div className={`p-4 border-t border-gray-700 flex ${isSidebarOpen ? 'items-center justify-center gap-4' : 'flex-col items-center gap-2'} ${!isSidebarOpen ? 'lg:flex hidden' : ''}`}>
          <button 
            className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
            title={!isSidebarOpen ? 'Profile' : undefined}
          >
            <ProfileIcon className="w-5 h-5 text-gray-300" />
          </button>
          <button 
            className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors"
            title={!isSidebarOpen ? 'Globe' : undefined}
          >
            <GlobeIcon className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 w-full lg:w-auto">
        {/* Header */}
        <header className="h-20 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Toggle Sidebar Button */}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors flex-shrink-0"
              aria-label="Toggle sidebar"
              title={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {isSidebarOpen ? (
                <ArrowLeftIcon className="w-5 h-5 text-gray-700" />
              ) : (
                <ArrowRightIcon className="w-5 h-5 text-gray-700" />
              )}
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 truncate">{title}</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">{subtitle}</p>
            </div>
          </div>
          {title === 'Overview' && (
            <div className="hidden sm:flex items-center gap-2">
              <label className="text-xs sm:text-sm text-gray-700 whitespace-nowrap">Time Period*</label>
              <select
                className="h-8 sm:h-9 px-2 sm:px-4 text-xs sm:text-sm bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all font-medium"
                aria-label="Time period"
              >
                <option>ALL TIME</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
              </select>
            </div>
          )}
        </header>

        {/* Content Area */}
        {children}

        {/* Footer */}
        <footer className="mt-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-t border-gray-200 bg-white">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              ©2026 ChottuLink | Tavas Analytics Inc. v1.2.2
            </p>
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
              <a href="#" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900">
                Terms of Use
              </a>
              <a href="#" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900">
                Privacy Policy
              </a>
              <a href="#" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900">
                Docs
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Floating Chat Button */}
      <button className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center gap-2 z-50">
        <ChatIcon className="w-5 h-5" />
        <span className="text-sm font-medium">Chat with a human</span>
      </button>

      {/* Floating Asterisk Icon */}
      <button className="fixed right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg hover:bg-yellow-500 transition-colors z-50">
        <AsteriskIcon className="w-5 h-5 text-yellow-900" />
      </button>
    </div>
  );
};

// Icon Components
const MainIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const TeamIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const LinksIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
  </svg>
);

const AnalyticsIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const KeysIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const PricingIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const SettingsIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ProfileIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const GlobeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const ChatIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const AsteriskIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2z" />
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

export default DashboardLayout;

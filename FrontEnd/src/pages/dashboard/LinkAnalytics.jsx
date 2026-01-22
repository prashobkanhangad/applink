import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/DashboardLayout';
import { getLinkAnalytics, getLinkDetails } from '../../services/appService';

/**
 * Link Analytics Page - Shows detailed analytics for a specific link
 */
export const LinkAnalytics = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract MongoDB _id from pathname (e.g., /dashboard/links/507f1f77bcf86cd799439011 -> 507f1f77bcf86cd799439011)
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const linkId = pathSegments[pathSegments.length - 1]; // This is the MongoDB _id
  
  const [linkData, setLinkData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [statsType, setStatsType] = useState('clicks'); // 'clicks' or 'installs'
  const [locationType, setLocationType] = useState('countries'); // 'countries' or 'cities'

  useEffect(() => {
    if (linkId && linkId !== 'create' && linkId !== 'edit') {
      loadLinkData();
    }
  }, [linkId, dateRange]);

  const loadLinkData = async () => {
    if (!linkId || linkId === 'create' || linkId === 'edit') {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      // linkId is MongoDB _id (e.g., "507f1f77bcf86cd799439011")
      const [detailsResult, analyticsResult] = await Promise.all([
        getLinkDetails(linkId),
        getLinkAnalytics(linkId, dateRange.start, dateRange.end),
      ]);
      
      if (detailsResult.success) {
        setLinkData(detailsResult.link);
      }
      
      if (analyticsResult.success) {
        setAnalytics(analyticsResult.analytics);
      }
    } catch (err) {
      console.error('Error loading link data:', err);
      setError(err.message || 'Failed to load link analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    const url = linkData?.domain && linkData?.path 
      ? `${linkData.domain}${linkData.path}` 
      : '';
    if (url) {
      navigator.clipboard.writeText(url);
      // You could add a toast notification here
    }
  };

  const handleShare = () => {
    const url = linkData?.domain && linkData?.path 
      ? `${linkData.domain}${linkData.path}` 
      : '';
    if (navigator.share && url) {
      navigator.share({
        title: linkData?.linkName || 'Link',
        text: 'Check out this link',
        url: url,
      });
    }
  };

  const handleClone = () => {
    navigate(`/dashboard/links?action=create&clone=${linkId}`);
  };

  const handleEdit = () => {
    navigate(`/dashboard/links?action=edit&id=${linkId}`);
  };

  const downloadQRCode = () => {
    // QR code download functionality
    // This would typically generate and download the QR code image
    console.log('Download QR code');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Link Analytics" subtitle="Loading...">
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading link analytics...</p>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  if (error && !linkData) {
    return (
      <DashboardLayout title="Link Analytics" subtitle="Error">
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600">{error}</p>
              <button
                onClick={() => navigate('/dashboard/links')}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Back to Links
              </button>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  const linkUrl = linkData?.domain && linkData?.path 
    ? `${linkData.domain}${linkData.path}` 
    : '-';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(linkUrl)}`;

  return (
    <DashboardLayout title="Link Analytics" subtitle={linkData?.linkName || 'Link Details'}>
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Date Range Selector */}
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-lg px-3 py-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="text-sm border-none outline-none"
              />
              <span className="text-gray-400">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="text-sm border-none outline-none"
              />
            </div>
          </div>

          {/* Link Details and QR Code */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Link Information */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {linkData?.linkName || 'Untitled Link'}
              </h2>
              <p className="text-sm text-gray-600 mb-2">
                <span className="font-medium">URL:</span> {linkUrl}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <span className="font-medium">Created:</span> {formatDate(linkData?.createdAt)}
              </p>
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Copy
                </button>
                <button
                  onClick={handleShare}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Share
                </button>
                <button
                  onClick={handleClone}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Clone
                </button>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Code</h3>
              <p className="text-sm text-gray-600 mb-4">
                Want to open this link on your phone? Just scan the QR code and copy it instantly!
              </p>
              <div className="flex justify-center mb-4">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="w-48 h-48 border-2 border-gray-200 rounded-lg"
                />
              </div>
              <button
                onClick={downloadQRCode}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Download QR Code
              </button>
            </div>
          </div>

          {/* Lifetime Stats */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Lifetime Stats</h3>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setStatsType('clicks')}
                  className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                    statsType === 'clicks'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Clicks
                </button>
                <button
                  onClick={() => setStatsType('installs')}
                  className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                    statsType === 'installs'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Installs
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Total {statsType === 'clicks' ? 'Clicks' : 'Installs'}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics?.lifetimeStats?.total || 0}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Last 7 Days</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics?.lifetimeStats?.last7Days || 0}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Last 30 Days</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {analytics?.lifetimeStats?.last30Days || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Location Analytics */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Location Analytics</h3>
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLocationType('countries')}
                  className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                    locationType === 'countries'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Countries
                </button>
                <button
                  onClick={() => setLocationType('cities')}
                  className={`px-3 py-1 text-sm font-medium rounded transition-colors ${
                    locationType === 'cities'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Cities
                </button>
              </div>
            </div>
            {analytics?.locationAnalytics && analytics.locationAnalytics.length > 0 ? (
              <div className="space-y-3">
                {analytics.locationAnalytics.map((location, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{location.name}</span>
                        <span className="text-sm text-gray-600">{location.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(location.count / (analytics.lifetimeStats?.total || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No location data available</p>
            )}
          </div>

          {/* Analytics by Platform */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics by Platform</h3>
            {analytics?.platformAnalytics && analytics.platformAnalytics.length > 0 ? (
              <div className="space-y-3">
                {analytics.platformAnalytics.map((platform, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">{platform.name}</span>
                        <span className="text-sm text-gray-600">{platform.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(platform.count / (analytics.lifetimeStats?.total || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No platform data available</p>
            )}
          </div>

          {/* Click Analytics Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Click Analytics</h3>
            {analytics?.clickAnalytics && analytics.clickAnalytics.length > 0 ? (
              <div className="h-64 flex items-end justify-between gap-2">
                {analytics.clickAnalytics.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-blue-600 rounded-t"
                      style={{ height: `${(data.count / Math.max(...analytics.clickAnalytics.map(d => d.count))) * 100}%` }}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2">{data.date}</span>
                    <span className="text-xs text-gray-900 font-medium">{data.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No click data available</p>
            )}
          </div>

          {/* Install Analytics */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Install Analytics</h3>
            {analytics?.installAnalytics && analytics.installAnalytics.length > 0 ? (
              <div className="h-64 flex items-end justify-between gap-2">
                {analytics.installAnalytics.map((data, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="w-full bg-green-600 rounded-t"
                      style={{ height: `${(data.count / Math.max(...analytics.installAnalytics.map(d => d.count))) * 100}%` }}
                    ></div>
                    <span className="text-xs text-gray-600 mt-2">{data.date}</span>
                    <span className="text-xs text-gray-900 font-medium">{data.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mb-3">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-600 mb-1">Data Not Available</p>
                <p className="text-xs text-gray-500">Try changing the date range.</p>
              </div>
            )}
          </div>

          {/* Analytics by Devices */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics by Devices</h3>
            {analytics?.deviceAnalytics && analytics.deviceAnalytics.length > 0 ? (
              <div className="flex items-center justify-center">
                <div className="relative w-64 h-64">
                  {/* Simple Donut Chart */}
                  <svg className="w-64 h-64 transform -rotate-90">
                    <circle
                      cx="128"
                      cy="128"
                      r="100"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="40"
                    />
                    {analytics.deviceAnalytics.map((device, index) => {
                      const total = analytics.deviceAnalytics.reduce((sum, d) => sum + d.count, 0);
                      const percentage = (device.count / total) * 100;
                      const circumference = 2 * Math.PI * 100;
                      const offset = analytics.deviceAnalytics.slice(0, index).reduce((sum, d) => {
                        const p = (d.count / total) * 100;
                        return sum + (p / 100) * circumference;
                      }, 0);
                      const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
                      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                      
                      return (
                        <circle
                          key={index}
                          cx="128"
                          cy="128"
                          r="100"
                          fill="none"
                          stroke={colors[index % colors.length]}
                          strokeWidth="40"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={-offset}
                          strokeLinecap="round"
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-semibold text-gray-900">
                      {analytics.deviceAnalytics.reduce((sum, d) => sum + d.count, 0)}
                    </span>
                  </div>
                </div>
                <div className="ml-8 space-y-2">
                  {analytics.deviceAnalytics.map((device, index) => {
                    const total = analytics.deviceAnalytics.reduce((sum, d) => sum + d.count, 0);
                    const percentage = ((device.count / total) * 100).toFixed(1);
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                    
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        ></div>
                        <span className="text-sm text-gray-900">{device.name}</span>
                        <span className="text-sm text-gray-600">({percentage}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No device data available</p>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default LinkAnalytics;

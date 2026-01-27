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
  
  // Extract MongoDB _id from pathname
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const linkId = pathSegments[pathSegments.length - 1];
  
  const [linkData, setLinkData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [statsType, setStatsType] = useState('clicks');
  const [locationType, setLocationType] = useState('countries');

  useEffect(() => {
    if (linkId && linkId !== 'create' && linkId !== 'edit') {
      loadLinkData();
    }
  }, [linkId, dateRange]);

  const loadLinkData = async () => {
    if (!linkId || linkId === 'create' || linkId === 'edit') return;
    
    setIsLoading(true);
    setError(null);
    try {
      const [detailsResult, analyticsResult] = await Promise.all([
        getLinkDetails(linkId),
        getLinkAnalytics(linkId, dateRange.start, dateRange.end),
      ]);
      
      if (detailsResult.success) setLinkData(detailsResult.link);
      if (analyticsResult.success) setAnalytics(analyticsResult.analytics);
    } catch (err) {
      console.error('Error loading link data:', err);
      setError(err.message || 'Failed to load link analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const getFullUrl = () => {
    if (!linkData?.domain || !linkData?.path) return '';
    return `${linkData.domain}${linkData.path.startsWith('/') ? '' : '/'}${linkData.path}`;
  };

  const handleCopy = () => {
    const url = getFullUrl();
    if (url) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    const url = getFullUrl();
    if (navigator.share && url) {
      navigator.share({ title: linkData?.linkName || 'Link', text: 'Check out this link', url });
    }
  };

  const handleClone = () => navigate(`/dashboard/links?action=create&clone=${linkId}`);
  const handleEdit = () => navigate(`/dashboard/links?action=edit&id=${linkId}`);

  const downloadQRCode = () => {
    const url = getFullUrl();
    if (!url) return;
    const downloadUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&data=${encodeURIComponent(url)}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `qr-${linkData?.path || 'code'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: true,
    }).toLowerCase();
  };

  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  // Country flag emoji helper
  const getCountryFlag = (country) => {
    const flags = {
      'India': '🇮🇳', 'United States': '🇺🇸', 'United Kingdom': '🇬🇧',
      'Germany': '🇩🇪', 'France': '🇫🇷', 'Canada': '🇨🇦', 'Australia': '🇦🇺',
    };
    return flags[country] || '🌍';
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Link Analytics" subtitle="Loading...">
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  const linkUrl = getFullUrl() || '-';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(linkUrl)}`;
  const totalClicks = analytics?.lifetimeStats?.total || 0;

  return (
    <DashboardLayout title="Link Analytics" subtitle={linkData?.linkName || 'Link Details'}>
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Header with Breadcrumb and Date Range */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Link Analytics</h1>
              <div className="flex items-center gap-2 text-sm">
                <button 
                  onClick={() => navigate('/dashboard/links')}
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Link List
                </button>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">{linkData?.linkName || 'Link'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Enter a date range</span>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                <span className="text-sm text-gray-700">{formatDisplayDate(dateRange.start)}</span>
                <span className="text-gray-400">–</span>
                <span className="text-sm text-gray-700">{formatDisplayDate(dateRange.end)}</span>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="sr-only"
                  id="start-date"
                />
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="sr-only"
                  id="end-date"
                />
                <label htmlFor="start-date" className="cursor-pointer">
                  <svg className="w-4 h-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </label>
              </div>
            </div>
          </div>

          {/* Link Details and QR Code Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Link Information Card */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {linkData?.linkName || 'Untitled Link'}
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Active
                </span>
              </div>
              
              <div className="mb-2">
                <span className="text-sm text-gray-500">URL: </span>
                <a 
                  href={linkUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline break-all"
                >
                  {linkUrl}
                </a>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(linkData?.createdAt)}</span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                    copied 
                      ? 'text-green-700 bg-green-50 border-green-200' 
                      : 'text-gray-600 bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
                <button
                  onClick={handleClone}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Clone
                </button>
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              </div>
            </div>

            {/* QR Code Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">QR Code</h3>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Want to open this link on your phone? Just scan the QR code and copy it instantly!
              </p>
              <div className="flex justify-center mb-4">
                <div className="p-2 bg-white border border-gray-100 rounded-lg shadow-sm">
                  <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
                </div>
              </div>
              <button
                onClick={downloadQRCode}
                className="w-full px-4 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Download QR Code
              </button>
            </div>
          </div>

          {/* Lifetime Stats */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Lifetime Stats</h3>
              <div className="flex items-center bg-gray-100 rounded-full p-0.5">
                <button
                  onClick={() => setStatsType('clicks')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    statsType === 'clicks'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Clicks
                </button>
                <button
                  onClick={() => setStatsType('installs')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    statsType === 'installs'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Installs
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-5 text-center">
                <p className="text-sm text-gray-500 mb-1">Total {statsType === 'clicks' ? 'Clicks' : 'Installs'}</p>
                <p className="text-3xl font-bold text-gray-900">{totalClicks}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 text-center">
                <p className="text-sm text-gray-500 mb-1">Last 7 Days {statsType === 'clicks' ? 'Clicks' : 'Installs'}</p>
                <p className="text-3xl font-bold text-gray-900">{analytics?.lifetimeStats?.last7Days || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-5 text-center">
                <p className="text-sm text-gray-500 mb-1">Last 30 Days {statsType === 'clicks' ? 'Clicks' : 'Installs'}</p>
                <p className="text-3xl font-bold text-gray-900">{analytics?.lifetimeStats?.last30Days || 0}</p>
              </div>
            </div>
          </div>

          {/* Location Analytics */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Location Analytics</h3>
              <div className="flex items-center border-b border-gray-200">
                <button
                  onClick={() => setLocationType('countries')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    locationType === 'countries'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Countries
                </button>
                <button
                  onClick={() => setLocationType('cities')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    locationType === 'cities'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Cities
                </button>
              </div>
            </div>
            {analytics?.locationAnalytics && analytics.locationAnalytics.length > 0 ? (
              <div>
                <div className="text-right text-xs text-gray-500 mb-2">Clicks</div>
                <div className="space-y-2">
                  {analytics.locationAnalytics.map((location, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <span className="text-base">{getCountryFlag(location.name)}</span>
                        <span className="text-sm text-gray-900">{location.name}</span>
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${Math.max((location.count / totalClicks) * 100, 10)}%` }}
                          >
                            {(location.count / totalClicks) * 100 > 15 && (
                              <span className="text-xs text-white font-medium">{location.count}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-600 min-w-[40px] text-right">{location.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No location data available</p>
            )}
          </div>

          {/* Analytics by Platform - Horizontal Bar Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Analytics by Platform</h3>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
            </div>
            {analytics?.platformAnalytics && analytics.platformAnalytics.length > 0 ? (
              <div className="space-y-3">
                {analytics.platformAnalytics.map((platform, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 min-w-[80px]">{platform.name}</span>
                    <div className="flex-1 flex items-center">
                      <div
                        className="bg-blue-500 h-6 rounded flex items-center px-2"
                        style={{ width: `${Math.max((platform.count / totalClicks) * 100, 5)}%` }}
                      >
                        <span className="text-xs text-white font-medium">{platform.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between text-xs text-gray-400 mt-4 pt-2 border-t border-gray-100">
                  {[0, 0.5, 1, 1.5, 2, 2.5, 3].map((val) => (
                    <span key={val}>{val.toFixed(1)}</span>
                  ))}
                </div>
                <div className="text-center text-xs text-gray-500">Clicks</div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No platform data available</p>
            )}
          </div>

          {/* Click Analytics and Install Analytics - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Click Analytics - Area Chart */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Click Analytics</h3>
                <button className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                </button>
              </div>
              {analytics?.clickAnalytics && analytics.clickAnalytics.length > 0 ? (
                <div className="relative h-48">
                  <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line key={i} x1="40" y1={30 + i * 25} x2="380" y2={30 + i * 25} stroke="#f3f4f6" strokeWidth="1" />
                    ))}
                    {/* Y-axis labels */}
                    {[2.0, 1.8, 1.6, 1.4, 1.2, 1.0].map((val, i) => (
                      <text key={i} x="35" y={35 + i * 20} textAnchor="end" fontSize="10" fill="#9ca3af">{val}</text>
                    ))}
                    {/* Area fill */}
                    <defs>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#a78bfa" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    {/* Generate path from data */}
                    {(() => {
                      const data = analytics.clickAnalytics;
                      const maxVal = Math.max(...data.map(d => d.count)) || 1;
                      const points = data.map((d, i) => ({
                        x: 40 + (i / (data.length - 1)) * 340,
                        y: 130 - ((d.count / maxVal) * 100)
                      }));
                      const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                      const areaPath = `${linePath} L ${points[points.length - 1].x} 130 L 40 130 Z`;
                      return (
                        <>
                          <path d={areaPath} fill="url(#areaGradient)" />
                          <path d={linePath} fill="none" stroke="#8b5cf6" strokeWidth="2" />
                          {points.map((p, i) => (
                            <circle key={i} cx={p.x} cy={p.y} r="3" fill="#8b5cf6" />
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                  <div className="flex justify-between text-xs text-gray-500 mt-2 px-10">
                    <span>{analytics.clickAnalytics[0]?.date}</span>
                    <span>{analytics.clickAnalytics[analytics.clickAnalytics.length - 1]?.date}</span>
                  </div>
                  <div className="text-center text-xs text-gray-500 mt-1">Dates</div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">No click data available</p>
              )}
            </div>

            {/* Install Analytics */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Install Analytics</h3>
              {analytics?.installAnalytics && analytics.installAnalytics.some(d => d.count > 0) ? (
                <div className="h-48">
                  {/* Similar chart implementation */}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">Data Not Available</p>
                  <p className="text-xs text-gray-500">Try changing the date range.</p>
                </div>
              )}
            </div>
          </div>

          {/* Analytics by Devices - Donut Chart */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Analytics by Devices</h3>
              <button className="p-1.5 text-gray-400 hover:text-gray-600 border border-gray-200 rounded-full">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
            </div>
            {analytics?.deviceAnalytics && analytics.deviceAnalytics.length > 0 ? (
              <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 mb-4">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                    {analytics.deviceAnalytics.map((device, index) => {
                      const total = analytics.deviceAnalytics.reduce((sum, d) => sum + d.count, 0);
                      const percentage = (device.count / total) * 100;
                      const circumference = 2 * Math.PI * 35;
                      const offset = analytics.deviceAnalytics.slice(0, index).reduce((sum, d) => {
                        return sum + ((d.count / total) * circumference);
                      }, 0);
                      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                      
                      return (
                        <circle
                          key={index}
                          cx="50"
                          cy="50"
                          r="35"
                          fill="none"
                          stroke={colors[index % colors.length]}
                          strokeWidth="20"
                          strokeDasharray={`${(percentage / 100) * circumference} ${circumference}`}
                          strokeDashoffset={-offset}
                        />
                      );
                    })}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900">
                      {analytics.deviceAnalytics.length > 0 
                        ? ((analytics.deviceAnalytics[0].count / analytics.deviceAnalytics.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  {analytics.deviceAnalytics.map((device, index) => {
                    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className="text-sm text-gray-600">{device.name}</span>
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

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { flag as countryFlag } from 'country-emoji';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button } from '../../components/ui/button';
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
  const [locationType, setLocationType] = useState('countries');
  const [metricType, setMetricType] = useState('clicks'); // 'clicks' | 'installs'

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
    if (!linkData?.path) return '';
    const base = linkData.domain || (() => {
      const sub = linkData.appId?.subDomain;
      if (!sub) return '';
      return sub.startsWith('http://') || sub.startsWith('https://') ? sub : `https://${sub}`;
    })();
    if (!base) return '';
    const path = linkData.path.startsWith('/') ? linkData.path : `/${linkData.path}`;
    return `${base.replace(/\/$/, '')}${path}`;
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
  const getCountryFlag = (country) => countryFlag(country) ?? '🌍';

  if (isLoading) {
    return (
      <DashboardLayout title="Link Analytics" subtitle="Loading...">
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                <p className="text-gray-500 mt-4">Loading link analytics...</p>
              </div>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  if (error && !linkData) {
    return (
      <DashboardLayout title="Link Analytics" subtitle="Error">
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <p className="text-destructive">{error}</p>
              <Button variant="hero" className="mt-4" onClick={() => navigate('/dashboard/links')}>
                Back to Links
              </Button>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  const linkUrl = getFullUrl() || '-';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(linkUrl)}`;
  const totalClicks = analytics?.lifetimeStats?.totalClicks ?? analytics?.lifetimeStats?.total ?? 0;
  const totalDownloads = analytics?.lifetimeStats?.totalInstalls ?? 0;
  const conversionRate = analytics?.lifetimeStats?.conversionRate ?? (totalClicks > 0 ? Math.round((totalDownloads / totalClicks) * 1000) / 10 : 0);
  const totalForBars = totalClicks || 1; // avoid division by zero in location/platform bars
  const totalForBarsInstalls = totalDownloads || 1;
  const locationData = locationType === 'cities'
    ? (metricType === 'installs' ? (analytics?.installCityAnalytics ?? []) : (analytics?.cityAnalytics ?? []))
    : (metricType === 'installs' ? (analytics?.installLocationAnalytics ?? []) : (analytics?.locationAnalytics ?? []));
  const platformData = metricType === 'installs' ? (analytics?.installPlatformAnalytics ?? []) : (analytics?.platformAnalytics ?? []);
  const deviceData = metricType === 'installs' ? (analytics?.installDeviceAnalytics ?? []) : (analytics?.deviceAnalytics ?? []);
  const totalForBarsCurrent = metricType === 'installs' ? totalForBarsInstalls : totalForBars;

  return (
    <DashboardLayout title="Link Analytics" subtitle={linkData?.linkName || 'Link Details'}>
      <main className="flex-1 overflow-y-auto bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Header with Breadcrumb and Date Range */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-sm">
                <Button variant="ghost" size="sm" className="text-primary -ml-2" onClick={() => navigate('/dashboard/links')}>
                  Link List
                </Button>
                <span className="text-gray-500">/</span>
                <span className="text-gray-900 font-medium">{linkData?.linkName || 'Link'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Date range</span>
              <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
                <input
                  type="date"
                  aria-label="Start date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                  className="text-sm text-gray-900 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 [color-scheme:inherit] max-w-[8rem]"
                />
                <span className="text-gray-500">–</span>
                <input
                  type="date"
                  aria-label="End date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                  className="text-sm text-gray-900 bg-transparent border-0 p-0 focus:outline-none focus:ring-0 [color-scheme:inherit] max-w-[8rem]"
                />
              </div>
            </div>
          </div>

          {/* Link Details and QR Code Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Link Information Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  {linkData?.linkName || 'Untitled Link'}
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  Active
                </span>
              </div>
              
              <div className="mb-2">
                <span className="text-sm text-gray-500">URL: </span>
                {linkUrl && (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) ? (
                  <a 
                    href={linkUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline break-all"
                  >
                    {linkUrl}
                  </a>
                ) : (
                  <span className="text-sm text-gray-900 break-all">{linkUrl || '—'}</span>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>{formatDate(linkData?.createdAt)}</span>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={copied ? "default" : "outline"}
                  size="sm"
                  onClick={handleCopy}
                  className={copied ? 'bg-primary/10 text-primary border-primary/20' : ''}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </Button>
                <Button variant="outline" size="sm" onClick={handleClone} className="border-primary/30 text-primary hover:bg-primary/10">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Clone
                </Button>
                <Button variant="hero" size="sm" onClick={handleEdit}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </Button>
              </div>
            </div>

            {/* QR Code Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Code</h3>
              <p className="text-sm text-gray-500 mb-4">
                Scan to open this link on your phone.
              </p>
              <div className="flex justify-center mb-4">
                <div className="p-2 bg-gray-50 border border-gray-200 rounded-xl">
                  <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
                </div>
              </div>
              <Button variant="hero" className="w-full" onClick={downloadQRCode}>
                Download QR Code
              </Button>
            </div>
          </div>

          {/* Lifetime Stats (for selected date range) */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Stats for selected date range</h3>
            <p className="text-sm text-gray-500 mb-4">
              {formatDisplayDate(dateRange.start)} – {formatDisplayDate(dateRange.end)}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-100 rounded-xl p-5 text-center border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Total Clicks</p>
                <p className="text-3xl font-bold text-gray-900">{totalClicks}</p>
              </div>
              <div className="bg-gray-100 rounded-xl p-5 text-center border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Total Downloads</p>
                <p className="text-3xl font-bold text-gray-900">{totalDownloads}</p>
              </div>
              <div className="bg-gray-100 rounded-xl p-5 text-center border border-gray-200">
                <p className="text-sm text-gray-500 mb-1">Conversion Rate</p>
                <p className="text-3xl font-bold text-gray-900">{conversionRate}%</p>
              </div>
            </div>
          </div>

          {/* Toggle: Clicks vs Installs for breakdown sections below */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Show breakdown by</span>
            <div className="flex items-center bg-gray-100 rounded-full p-0.5 border border-gray-200">
              <button
                type="button"
                onClick={() => setMetricType('clicks')}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  metricType === 'clicks' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Clicks
              </button>
              <button
                type="button"
                onClick={() => setMetricType('installs')}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  metricType === 'installs' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Installs
              </button>
            </div>
          </div>

          {/* Location Analytics */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Location Analytics</h3>
              <div className="flex items-center border-b border-gray-200">
                <button
                  onClick={() => setLocationType('countries')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    locationType === 'countries'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Countries
                </button>
                <button
                  onClick={() => setLocationType('cities')}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    locationType === 'cities'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-gray-500 hover:text-gray-900'
                  }`}
                >
                  Cities
                </button>
              </div>
            </div>
            {locationData.length > 0 && !locationData.every(l => l.name === 'No data') ? (
              <div>
                <div className="text-right text-xs text-gray-500 mb-2">{metricType === 'clicks' ? 'Clicks' : 'Installs'}</div>
                <div className="space-y-2">
                  {locationData.map((location, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 min-w-[120px]">
                        <span className="text-base">{locationType === 'cities' ? '📍' : getCountryFlag(location.name)}</span>
                        <span className="text-sm text-gray-900">{location.name}</span>
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-100/30 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-primary h-6 rounded-full flex items-center justify-end pr-2"
                            style={{ width: `${Math.max((location.count / totalForBarsCurrent) * 100, 10)}%` }}
                          >
                            {(location.count / totalForBarsCurrent) * 100 > 15 && (
                              <span className="text-xs text-white font-medium">{location.count}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 min-w-[40px] text-right">{location.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-100 py-12 text-center">
                <p className="text-sm text-gray-500">No {metricType} location data available</p>
              </div>
            )}
          </div>

          {/* Analytics by Platform - Horizontal Bar Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics by Platform</h3>
            {platformData.length > 0 && !platformData.every(p => p.name === 'No data') ? (
              <div className="space-y-3">
                {platformData.map((platform, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-sm text-gray-900 min-w-[80px]">{platform.name}</span>
                    <div className="flex-1 flex items-center">
                      <div
                        className="bg-primary h-6 rounded flex items-center px-2"
                        style={{ width: `${Math.max((platform.count / totalForBarsCurrent) * 100, 5)}%` }}
                      >
                        <span className="text-xs text-white font-medium">{platform.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between text-xs text-gray-500 mt-4 pt-2 border-t border-gray-200">
                  {[0, 0.5, 1, 1.5, 2, 2.5, 3].map((val) => (
                    <span key={val}>{val.toFixed(1)}</span>
                  ))}
                </div>
                <div className="text-center text-xs text-gray-500">{metricType === 'clicks' ? 'Clicks' : 'Installs'}</div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-100 py-12 text-center">
                <p className="text-sm text-gray-500">No {metricType} platform data available</p>
              </div>
            )}
          </div>

          {/* Click Analytics and Install Analytics - Side by Side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Click Analytics - Area Chart */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Click Analytics</h3>
              {analytics?.clickAnalytics && analytics.clickAnalytics.length > 0 ? (
                <div className="relative h-48">
                  <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line key={i} x1="40" y1={30 + i * 25} x2="380" y2={30 + i * 25} stroke="hsl(var(--border))" strokeWidth="1" />
                    ))}
                    {[2.0, 1.8, 1.6, 1.4, 1.2, 1.0].map((val, i) => (
                      <text key={i} x="35" y={35 + i * 20} textAnchor="end" fontSize="10" fill="#6b7280">{val}</text>
                    ))}
                    <defs>
                      <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    {(() => {
                      const data = analytics.clickAnalytics;
                      const maxVal = Math.max(...data.map(d => d.count), 1);
                      const n = data.length;
                      const points = data.map((d, i) => ({
                        x: 40 + (n === 1 ? 170 : (i / (n - 1)) * 340),
                        y: 130 - ((d.count / maxVal) * 100)
                      }));
                      const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
                      const areaPath = `${linePath} L ${points[points.length - 1].x} 130 L 40 130 Z`;
                      return (
                        <>
                          <path d={areaPath} fill="url(#areaGradient)" />
                          <path d={linePath} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
                          {points.map((p, i) => (
                            <circle key={i} cx={p.x} cy={p.y} r="3" fill="hsl(var(--primary))" />
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                  <div className="flex justify-between text-xs text-gray-500 mt-2 px-10">
                    <span>{analytics.clickAnalytics[0]?.date}</span>
                    <span>{analytics.clickAnalytics[analytics.clickAnalytics.length - 1]?.date}</span>
                  </div>
                  <div className="text-center text-xs text-gray-500 mt-1">Date range</div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-100 py-12 text-center">
                  <p className="text-sm text-gray-500">No click data available</p>
                </div>
              )}
            </div>

            {/* Install / Download Analytics (summary for selected range) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Analytics</h3>
              {analytics?.installAnalytics && analytics.installAnalytics.length > 0 ? (
                <div className="flex flex-col items-center justify-center h-48">
                  <p className="text-3xl font-bold text-gray-900 mb-1">{totalDownloads}</p>
                  <p className="text-sm text-gray-500 mb-2">downloads in selected range</p>
                  <p className="text-xs text-gray-500">{analytics.installAnalytics[0]?.date}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-48 rounded-xl border border-dashed border-gray-200 bg-gray-100">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-900 mb-1">No downloads in this range</p>
                  <p className="text-xs text-gray-500">Try changing the date range.</p>
                </div>
              )}
            </div>
          </div>

          {/* Analytics by Devices - Donut Chart */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics by Devices</h3>
            {deviceData.length > 0 && !deviceData.every(d => d.name === 'No data') ? (
              <div className="flex flex-col items-center">
                <div className="relative w-48 h-48 mb-4">
                  <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                    {deviceData.map((device, index) => {
                      const total = deviceData.reduce((sum, d) => sum + d.count, 0);
                      const percentage = total > 0 ? (device.count / total) * 100 : 0;
                      const circumference = 2 * Math.PI * 35;
                      const offset = deviceData.slice(0, index).reduce((sum, d) => {
                        return sum + (total > 0 ? (d.count / total) * circumference : 0);
                      }, 0);
                      const colors = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                      
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
                      {deviceData.length > 0 && (() => {
                        const total = deviceData.reduce((sum, d) => sum + d.count, 0);
                        return total > 0 ? ((deviceData[0].count / total) * 100).toFixed(1) : 0;
                      })()}%
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  {deviceData.map((device, index) => {
                    const colors = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className="text-sm text-gray-900">{device.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-100 py-12 text-center">
                <p className="text-sm text-gray-500">No {metricType} device data available</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default LinkAnalytics;

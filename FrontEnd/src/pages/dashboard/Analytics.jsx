import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { flag as countryFlag } from 'country-emoji';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { getAnalyticsOverview } from '../../services/appService';

const defaultDateRange = {
  start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0],
};

const formatDisplayDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getCountryFlag = (country) => countryFlag(country) ?? '🌍';

/**
 * Analytics Page – Account-wide stats, date filter, and link performance
 */
export const Analytics = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [metricType, setMetricType] = useState('clicks'); // 'clicks' | 'installs'
  const [stats, setStats] = useState({
    linksCount: 0,
    totalClicks: 0,
    totalInstalls: 0,
    conversionRate: 0,
    linkPerformance: [],
    locationAnalytics: [],
    platformAnalytics: [],
    deviceAnalytics: [],
    installLocationAnalytics: [],
    installPlatformAnalytics: [],
    installDeviceAnalytics: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange.start, dateRange.end]);

  const loadAnalytics = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAnalyticsOverview(dateRange.start, dateRange.end);
      if (result.success) {
        setStats({
          linksCount: result.linksCount ?? 0,
          totalClicks: result.totalClicks ?? 0,
          totalInstalls: result.totalInstalls ?? 0,
          conversionRate: result.conversionRate ?? 0,
          linkPerformance: result.linkPerformance ?? [],
          locationAnalytics: result.locationAnalytics ?? [],
          platformAnalytics: result.platformAnalytics ?? [],
          deviceAnalytics: result.deviceAnalytics ?? [],
          installLocationAnalytics: result.installLocationAnalytics ?? [],
          installPlatformAnalytics: result.installPlatformAnalytics ?? [],
          installDeviceAnalytics: result.installDeviceAnalytics ?? [],
        });
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Analytics" subtitle="View your link performance">
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
                <p className="text-gray-500 mt-4">Loading analytics...</p>
              </div>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Analytics" subtitle="Error">
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <p className="text-destructive">{error}</p>
              <Button variant="hero" className="mt-4" onClick={loadAnalytics}>
                Retry
              </Button>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  const {
    linksCount,
    totalClicks,
    totalInstalls,
    conversionRate,
    linkPerformance,
    locationAnalytics,
    platformAnalytics,
    deviceAnalytics,
    installLocationAnalytics,
    installPlatformAnalytics,
    installDeviceAnalytics,
  } = stats;

  const totalForBars = totalClicks || 1;
  const totalForBarsInstalls = totalInstalls || 1;
  const locationData = metricType === 'installs' ? installLocationAnalytics : locationAnalytics;
  const platformData = metricType === 'installs' ? installPlatformAnalytics : platformAnalytics;
  const deviceData = metricType === 'installs' ? installDeviceAnalytics : deviceAnalytics;
  const totalForBarsCurrent = metricType === 'installs' ? totalForBarsInstalls : totalForBars;
  const hasLocation = locationData.length > 0 && !locationData.every((l) => l.name === 'No data');
  const hasPlatform = platformData.length > 0 && !platformData.every((p) => p.name === 'No data');
  const hasDevice = deviceData.length > 0 && !deviceData.every((d) => d.name === 'No data');

  return (
    <DashboardLayout title="Analytics" subtitle="View your link performance">
      <main className="flex-1 overflow-y-auto bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Date filter */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Account analytics</h2>
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
         

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Total Clicks</span>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{totalClicks.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Total Installs</span>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{totalInstalls.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Conversion Rate</span>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{conversionRate}%</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Total Links</span>
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <p className="text-2xl font-semibold text-gray-900">{linksCount.toLocaleString()}</p>
            </div>
          </div>

          {/* Clicks / Installs toggle for breakdown charts */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500"></span>
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

          {/* Country, Platform, Device – 3 sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* By country */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">By country</h3>
              {hasLocation ? (
                <div className="space-y-2">
                  {locationData.map((loc, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 min-w-[100px]">
                        <span className="text-base">{getCountryFlag(loc.name)}</span>
                        <span className="text-sm text-gray-900 truncate">{loc.name}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="w-full bg-gray-100/30 rounded-full h-5 overflow-hidden">
                          <div
                            className="bg-primary h-5 rounded-full flex items-center justify-end pr-1.5"
                            style={{ width: `${Math.max((loc.count / totalForBarsCurrent) * 100, 8)}%` }}
                          >
                            {(loc.count / totalForBarsCurrent) * 100 > 18 && (
                              <span className="text-xs text-white font-medium">{loc.count}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 min-w-[32px] text-right">{loc.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-100/20 py-10 text-center">
                  <p className="text-sm text-gray-500">No {metricType} location data in this range</p>
                </div>
              )}
            </div>

            {/* By platform */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">By platform</h3>
              {hasPlatform ? (
                <div className="space-y-3">
                  {platformData.map((platform, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="text-sm text-gray-900 min-w-[72px]">{platform.name}</span>
                      <div className="flex-1 flex items-center">
                        <div
                          className="bg-primary h-6 rounded flex items-center px-2"
                          style={{ width: `${Math.max((platform.count / totalForBarsCurrent) * 100, 6)}%` }}
                        >
                          <span className="text-xs text-white font-medium">{platform.count}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-100/20 py-10 text-center">
                  <p className="text-sm text-gray-500">No {metricType} platform data in this range</p>
                </div>
              )}
            </div>

            {/* By device (donut) */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">By device</h3>
              {hasDevice ? (
                <div className="flex flex-col items-center">
                  <div className="relative w-40 h-40 mb-3">
                    <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                      {deviceData.map((device, index) => {
                        const total = deviceData.reduce((sum, d) => sum + d.count, 0);
                        const percentage = total > 0 ? (device.count / total) * 100 : 0;
                        const circumference = 2 * Math.PI * 35;
                        const offset = deviceData.slice(0, index).reduce((sum, d) => sum + (total > 0 ? (d.count / total) * circumference : 0), 0);
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
                      <span className="text-xl font-bold text-gray-900">
                        {deviceData.length > 0 && (() => {
                          const total = deviceData.reduce((sum, d) => sum + d.count, 0);
                          return total > 0 ? ((deviceData[0].count / total) * 100).toFixed(0) : 0;
                        })()}%
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {deviceData.map((device, index) => {
                      const colors = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
                      return (
                        <div key={index} className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                          <span className="text-sm text-gray-900">{device.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-100/20 py-10 text-center">
                  <p className="text-sm text-gray-500">No {metricType} device data in this range</p>
                </div>
              )}
            </div>
          </div>

          {/* Link performance table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-900 px-6 py-4 border-b border-gray-200">
              Link performance
            </h3>
            {linkPerformance.length === 0 ? (
              <div className="text-center py-12 px-6">
                <p className="text-sm text-gray-500">
                  No links yet. Create links to see performance metrics here.
                </p>
                <Button variant="hero" className="mt-4" onClick={() => navigate('/dashboard/links')}>
                  Create link
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-100">
                      <th className="text-left font-medium text-gray-900 px-6 py-3">Link</th>
                      <th className="text-left font-medium text-gray-900 px-6 py-3">URL / Path</th>
                      <th className="text-right font-medium text-gray-900 px-6 py-3">Clicks</th>
                      <th className="text-right font-medium text-gray-900 px-6 py-3">Installs</th>
                      <th className="text-right font-medium text-gray-900 px-6 py-3">Conversion</th>
                      <th className="text-right font-medium text-gray-900 px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {linkPerformance.map((row) => (
                      <tr key={row.linkId} className="border-b border-gray-200 last:border-0 hover:bg-gray-100">
                        <td className="px-6 py-3 text-gray-900 font-medium">{row.linkName}</td>
                        <td className="px-6 py-3 text-gray-500 truncate max-w-[200px]" title={row.domain}>
                          {row.domain || row.path}
                        </td>
                        <td className="px-6 py-3 text-gray-900 text-right">{row.clicks.toLocaleString()}</td>
                        <td className="px-6 py-3 text-gray-900 text-right">{row.installs.toLocaleString()}</td>
                        <td className="px-6 py-3 text-gray-900 text-right">{row.conversionRate}%</td>
                        <td className="px-6 py-3 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary"
                            onClick={() => navigate(`/dashboard/links/${row.linkId}`)}
                          >
                            View details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Analytics;

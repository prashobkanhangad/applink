import React, { useEffect, useState } from 'react';
import { getAdminVisitorAnalytics } from '../../services/adminService';

const defaultDateRange = {
  start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  end: new Date().toISOString().split('T')[0],
};

const SOURCE_TYPE_LABELS = {
  direct: 'Direct',
  search: 'Search',
  social: 'Social',
  referral: 'Referral',
  campaign: 'Campaign',
  internal: 'Internal',
};

const formatNumber = (value) => Number(value || 0).toLocaleString();

const BarRow = ({ label, count, total, sub }) => {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="min-w-[120px] max-w-[160px]">
        <p className="text-sm text-gray-900 truncate" title={label}>{label}</p>
        {sub ? <p className="text-xs text-gray-500 truncate">{sub}</p> : null}
      </div>
      <div className="flex-1 min-w-0">
        <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
          <div
            className="bg-primary h-5 rounded-full flex items-center justify-end pr-1.5"
            style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
          >
            {pct > 18 && (
              <span className="text-xs text-white font-medium">{formatNumber(count)}</span>
            )}
          </div>
        </div>
      </div>
      <span className="text-sm text-gray-500 min-w-[40px] text-right">{formatNumber(count)}</span>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 text-center">
    <p className="text-sm text-gray-500">{message}</p>
  </div>
);

export const AdminTraffic = () => {
  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getAdminVisitorAnalytics({ startDate: dateRange.start, endDate: dateRange.end })
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || 'Failed to load traffic');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dateRange.start, dateRange.end]);

  if (loading) {
    return (
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          <p className="text-gray-500 mt-4">Loading traffic…</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto text-center py-12 text-red-600">{error}</div>
      </main>
    );
  }

  const totals = data?.totals || { pageViews: 0, uniqueVisitors: 0, sessions: 0, newVisitors: 0, returningVisitors: 0 };
  const pages = data?.pages || [];
  const sources = data?.sources || [];
  const sourceTypes = data?.sourceTypes || [];
  const referrers = data?.referrers || [];
  const daily = data?.daily || [];
  const countries = data?.countries || [];
  const devices = data?.devices || [];
  const maxDailyViews = Math.max(1, ...daily.map((d) => d.views || 0));
  const sourceVisitorTotal = sources.reduce((sum, s) => sum + (s.visitors || 0), 0) || 1;
  const countryTotal = countries.reduce((sum, c) => sum + (c.count || 0), 0) || 1;
  const deviceTotal = devices.reduce((sum, d) => sum + (d.count || 0), 0) || 1;

  const cards = [
    { label: 'Unique visitors', value: totals.uniqueVisitors },
    { label: 'Page views', value: totals.pageViews },
    { label: 'Sessions', value: totals.sessions },
    { label: 'New visitors', value: totals.newVisitors },
  ];

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Site traffic</h2>
            <p className="text-sm text-gray-500">Where visitors come from and which public pages they view.</p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
            <input
              type="date"
              aria-label="Start date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className="text-sm text-gray-900 bg-transparent border-0 p-0 focus:outline-none max-w-[8rem]"
            />
            <span className="text-gray-500">–</span>
            <input
              type="date"
              aria-label="End date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className="text-sm text-gray-900 bg-transparent border-0 p-0 focus:outline-none max-w-[8rem]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card) => (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{formatNumber(card.value)}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Visitors over time</h3>
          {daily.some((d) => d.views > 0) ? (
            <div className="flex items-end gap-1 h-40">
              {daily.map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center justify-end h-full min-w-0">
                  <div
                    className="w-full max-w-[18px] bg-primary rounded-t"
                    style={{ height: `${Math.max((day.views / maxDailyViews) * 100, day.views > 0 ? 4 : 0)}%` }}
                    title={`${day.date}: ${day.visitors} visitors, ${day.views} views`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <EmptyState message="No visits in this date range yet. Open a public page to start collecting data." />
          )}
          {daily.length > 0 && daily.some((d) => d.views > 0) && (
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>{daily[0].date}</span>
              <span>{daily[daily.length - 1].date}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Where visitors come from</h3>
            <p className="text-xs text-gray-500 mb-4">First-touch source for each session (UTM, search, social, or referrer).</p>
            {sources.length > 0 ? (
              <div className="space-y-3">
                {sources.map((row) => (
                  <BarRow
                    key={row.source}
                    label={row.source || 'Direct'}
                    sub={SOURCE_TYPE_LABELS[row.sourceType] || row.sourceType}
                    count={row.visitors}
                    total={sourceVisitorTotal}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No source data yet" />
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Source type</h3>
            <p className="text-xs text-gray-500 mb-4">Direct, search, social, referral, and campaign traffic.</p>
            {sourceTypes.length > 0 ? (
              <div className="space-y-3">
                {sourceTypes.map((row) => (
                  <BarRow
                    key={row.sourceType}
                    label={SOURCE_TYPE_LABELS[row.sourceType] || row.sourceType}
                    count={row.visitors}
                    total={sourceVisitorTotal}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No source type data yet" />
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Pages visited</h3>
            <p className="text-xs text-gray-500 mt-1">Which public pages people land on and browse.</p>
          </div>
          {pages.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Page</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Path</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Views</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Visitors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pages.map((page) => (
                    <tr key={page.path} className="bg-white hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{page.title || page.path}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">{page.path}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatNumber(page.views)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatNumber(page.visitors)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6">
              <EmptyState message="No page views yet" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top referrers</h3>
            {referrers.length > 0 ? (
              <div className="space-y-3">
                {referrers.map((row) => (
                  <BarRow
                    key={row.host}
                    label={row.host}
                    count={row.visitors}
                    total={sourceVisitorTotal}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No external referrers yet" />
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">By country</h3>
            {countries.length > 0 && !countries.every((c) => c.name === 'unknown' && c.count === 0) ? (
              <div className="space-y-3">
                {countries.map((row) => (
                  <BarRow
                    key={row.name}
                    label={row.name === 'unknown' ? 'Unknown' : row.name}
                    count={row.count}
                    total={countryTotal}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No country data yet" />
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">By device</h3>
            {devices.length > 0 ? (
              <div className="space-y-3">
                {devices.map((row) => (
                  <BarRow
                    key={row.name}
                    label={(row.name || 'desktop').charAt(0).toUpperCase() + (row.name || 'desktop').slice(1)}
                    count={row.count}
                    total={deviceTotal}
                  />
                ))}
              </div>
            ) : (
              <EmptyState message="No device data yet" />
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default AdminTraffic;

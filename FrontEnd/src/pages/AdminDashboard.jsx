import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PageMeta } from '../components/PageMeta';
import { AdminLayout } from '../components/AdminLayout';
import { useChatSocket } from '../contexts/ChatSocketContext';
import { playNotificationSound } from '../utils/notificationSound';
import { getAdminStats, getAdminUsers, getAdminApps, getAdminApp, getAdminUser, updateUserRole, getAdminPlans, getAdminPlan, createAdminPlan, updateAdminPlan, deleteAdminPlan, getAdminLinks, getAdminLink, deleteAdminLink, getAdminAffiliates, getAdminChatConversations, getAdminChatMessages, sendAdminChatReply } from '../services/adminService';

const META = {
  title: 'Admin Dashboard',
  description: 'DeepLink admin dashboard — manage users, apps, and settings.',
};

/**
 * Admin overview: stats from API.
 */
const AdminOverview = () => {
  const [stats, setStats] = useState({ totalUsers: null, totalApps: null, totalLinks: null, totalAffiliates: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-center py-12">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
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

  const cards = [
    { label: 'Total Users', value: stats.totalUsers ?? '—' },
    { label: 'Total Apps', value: stats.totalApps ?? '—' },
    { label: 'Total Links', value: stats.totalLinks ?? '—' },
    { label: 'Affiliate signups', value: stats.totalAffiliates ?? '—' },
  ];

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 shadow-sm">
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{card.value}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Admin Overview</h2>
          <p className="text-sm text-gray-600">
            Use the sidebar to manage Users and Apps. Stats above are live from the database.
          </p>
        </div>
      </div>
    </main>
  );
};

/**
 * Admin users list with search and role update.
 */
const AdminUsers = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ users: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const fetchUsers = (page = 1) => {
    setLoading(true);
    getAdminUsers({ page, limit: 20, search })
      .then((res) => setData({
        users: res.users || [],
        total: res.total || 0,
        page: res.page || 1,
        limit: res.limit || 20,
        totalPages: res.totalPages || 0,
      }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers(1);
  }, [search]);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await updateUserRole(userId, newRole);
      fetchUsers(data.page);
    } catch (e) {
      setError(e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            <h2 className="text-lg font-semibold text-gray-900">Users</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by email or username..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput)}
                className="flex-1 min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setSearch(searchInput)}
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800"
              >
                Search
              </button>
            </div>
          </div>
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm">{error}</div>
          )}
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-14">Photo</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(data.users || []).map((u) => (
                      <tr key={u._id} className="bg-white hover:bg-gray-50">
                        <td className="px-4 py-3">
                          {u.image_url ? (
                            <img
                              src={u.image_url}
                              alt=""
                              className="w-10 h-10 rounded-full object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-semibold text-gray-600 border border-gray-300">
                              {(u.username || u.email || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{u.email || '—'}</td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/users/${u._id}`)}
                            className="text-left text-primary hover:underline font-medium text-gray-900 hover:text-primary"
                          >
                            {u.username || u.email || '—'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{u.role || 'user'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{u.status || 'active'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-4 py-3 flex items-center gap-2 flex-wrap">
                          <select
                            value={u.role || 'user'}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            disabled={updatingId === u._id}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="user">user</option>
                            <option value="admin">admin</option>
                            <option value="sub_user">sub_user</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Page {data.page} of {data.totalPages} ({data.total} total)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={data.page <= 1}
                      onClick={() => fetchUsers(data.page - 1)}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={data.page >= data.totalPages}
                      onClick={() => fetchUsers(data.page + 1)}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};

/**
 * Admin affiliates list (signups) with search and pagination.
 */
const AdminAffiliates = () => {
  const [data, setData] = useState({ affiliates: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchAffiliates = (page = 1) => {
    setLoading(true);
    getAdminAffiliates({ page, limit: 20, search })
      .then((res) => setData({
        affiliates: res.affiliates || [],
        total: res.total || 0,
        page: res.page || 1,
        limit: res.limit || 20,
        totalPages: res.totalPages || 0,
      }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAffiliates(1);
  }, [search]);

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            <h2 className="text-lg font-semibold text-gray-900">Affiliate signups</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput)}
                className="flex-1 min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setSearch(searchInput)}
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800"
              >
                Search
              </button>
            </div>
          </div>
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm">{error}</div>
          )}
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Website</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(data.affiliates || []).map((row) => (
                      <tr key={row._id} className="bg-white hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{row.name || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.email || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{row.phone || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.website ? (
                            <a href={row.website.startsWith('http') ? row.website : `https://${row.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate max-w-[120px] inline-block">
                              {row.website}
                            </a>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-[200px] truncate" title={row.message || ''}>{row.message || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Page {data.page} of {data.totalPages} ({data.total} total)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={data.page <= 1}
                      onClick={() => fetchAffiliates(data.page - 1)}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={data.page >= data.totalPages}
                      onClick={() => fetchAffiliates(data.page + 1)}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};

/**
 * Admin apps list with search and pagination.
 */
const AdminApps = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ apps: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const fetchApps = (page = 1) => {
    setLoading(true);
    getAdminApps({ page, limit: 20, search })
      .then((res) => setData({
        apps: res.apps || [],
        total: res.total || 0,
        page: res.page || 1,
        limit: res.limit || 20,
        totalPages: res.totalPages || 0,
      }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApps(1);
  }, [search]);

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            <h2 className="text-lg font-semibold text-gray-900">Apps</h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by name or subdomain..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput)}
                className="flex-1 min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setSearch(searchInput)}
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800"
              >
                Search
              </button>
            </div>
          </div>
          {error && (
            <div className="p-4 bg-red-50 text-red-700 text-sm">{error}</div>
          )}
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subdomain</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Links</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created by</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(data.apps || []).map((app) => (
                      <tr key={app._id} className="bg-white hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          <button
                            type="button"
                            onClick={() => navigate(`/admin/apps/${app._id}`)}
                            className="text-left text-primary hover:underline font-medium hover:text-primary"
                          >
                            {app.name || '—'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{app.subDomain || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{app.linkCount ?? 0}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {app.createdBy?.email || app.createdBy?.username || '—'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Page {data.page} of {data.totalPages} ({data.total} total)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={data.page <= 1}
                      onClick={() => fetchApps(data.page - 1)}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={data.page >= data.totalPages}
                      onClick={() => fetchApps(data.page + 1)}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};

/**
 * Admin links list with search, optional app filter, pagination.
 */
const AdminLinks = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ links: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [appIdFilter, setAppIdFilter] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchLinks = (page = 1) => {
    setLoading(true);
    getAdminLinks({ page, limit: 20, search, appId: appIdFilter })
      .then((res) => setData({
        links: res.links || [],
        total: res.total || 0,
        page: res.page || 1,
        limit: res.limit || 20,
        totalPages: res.totalPages || 0,
      }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLinks(1);
  }, [search, appIdFilter]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this link?')) return;
    setDeletingId(id);
    try {
      await deleteAdminLink(id);
      fetchLinks(data.page);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center flex-wrap">
            <h2 className="text-lg font-semibold text-gray-900">Links</h2>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Search by name, path, or URL..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput)}
                className="flex-1 min-w-[180px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <input
                type="text"
                placeholder="App ID (optional)"
                value={appIdFilter}
                onChange={(e) => setAppIdFilter(e.target.value)}
                className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button type="button" onClick={() => { setSearch(searchInput); fetchLinks(1); }} className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800">
                Search
              </button>
            </div>
          </div>
          {error && <div className="p-4 bg-red-50 text-red-700 text-sm">{error}</div>}
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Link name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">App</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Path</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Android</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">iOS</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(data.links || []).map((link) => (
                      <tr key={link._id} className="bg-white hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          <button type="button" onClick={() => navigate(`/admin/links/${link._id}`)} className="text-left text-primary hover:underline">
                            {link.linkName || '—'}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">{link.appId?.name || link.appId?.subDomain || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 font-mono truncate max-w-[120px]" title={link.path}>{link.path || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 truncate max-w-[160px]" title={link.destinationUrl}>{link.destinationUrl || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{link.androidBehavior || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{link.iosBehavior || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{link.createdAt ? new Date(link.createdAt).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <button type="button" onClick={() => navigate(`/admin/links/${link._id}`)} className="text-sm text-primary hover:underline">View</button>
                          <button type="button" onClick={() => handleDelete(link._id)} disabled={deletingId === link._id} className="text-sm text-red-600 hover:underline disabled:opacity-50">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.links.length === 0 && !loading && <p className="p-4 text-sm text-gray-500">No links found.</p>}
              {data.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                  <span>Page {data.page} of {data.totalPages} ({data.total} total)</span>
                  <div className="flex gap-2">
                    <button type="button" disabled={data.page <= 1} onClick={() => fetchLinks(data.page - 1)} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50">Previous</button>
                    <button type="button" disabled={data.page >= data.totalPages} onClick={() => fetchLinks(data.page + 1)} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
};

/**
 * View single user: details + their apps.
 */
const AdminUserView = ({ userId: userIdProp }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const id = userIdProp;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getAdminUser(id)
      .then((res) => {
        setUser(res.user || null);
        setApps(res.apps || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) {
    navigate('/admin/users');
    return null;
  }

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/admin/users')} className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            ← Back to users
          </button>
        </div>
        {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : user ? (
          <>
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">User details</h2>
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex-shrink-0">
                  {user.image_url ? (
                    <img
                      src={user.image_url}
                      alt={user.username || user.email || 'User'}
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-2xl font-semibold text-gray-600 border-2 border-gray-300">
                      {(user.username || user.email || '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm flex-1">
                  <div><dt className="text-gray-500">Email</dt><dd className="font-medium text-gray-900">{user.email || '—'}</dd></div>
                  <div><dt className="text-gray-500">Username</dt><dd className="font-medium text-gray-900">{user.username || '—'}</dd></div>
                  <div><dt className="text-gray-500">Role</dt><dd className="font-medium text-gray-900">{user.role || 'user'}</dd></div>
                  <div><dt className="text-gray-500">Status</dt><dd className="font-medium text-gray-900">{user.status || 'active'}</dd></div>
                  <div><dt className="text-gray-500">Auth provider</dt><dd className="font-medium text-gray-900">{user.authProvider || '—'}</dd></div>
                  <div><dt className="text-gray-500">Created</dt><dd className="font-medium text-gray-900">{user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</dd></div>
                  {user.lastLoginAt && <div><dt className="text-gray-500">Last login</dt><dd className="font-medium text-gray-900">{new Date(user.lastLoginAt).toLocaleString()}</dd></div>}
                </dl>
              </div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <h2 className="text-lg font-semibold text-gray-900 p-4 border-b border-gray-200">Apps ({apps.length})</h2>
              {apps.length === 0 ? <p className="p-4 text-sm text-gray-500">No apps created yet.</p> : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subdomain</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Links</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {apps.map((app) => (
                        <tr key={app._id} className="bg-white hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{app.name || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{app.subDomain || '—'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{app.linkCount ?? 0}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{app.createdAt ? new Date(app.createdAt).toLocaleDateString() : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        ) : !loading && !error && <p className="text-gray-500">User not found.</p>}
      </div>
    </main>
  );
};

/**
 * View single app: all app details (admin).
 */
const safeDisplay = (v) => {
  if (v == null) return '—';
  if (typeof v === 'object' && v !== null) {
    if (v instanceof Date) return v.toLocaleString();
    if (Array.isArray(v)) return v.join(', ') || '—';
    if (v.enum && Array.isArray(v.enum)) return v.enum.join(', ');
    return typeof v.toString === 'function' && v.toString !== Object.prototype.toString ? v.toString() : '—';
  }
  return String(v);
};

const AdminAppView = ({ appId: appIdProp }) => {
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const id = appIdProp;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getAdminApp(id)
      .then((res) => {
        const appData = res?.app != null ? res.app : (res && typeof res === 'object' && (res._id != null || res.name != null) ? res : null);
        setApp(appData);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) {
    navigate('/admin/apps');
    return null;
  }

  const data = app;

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/admin/apps')} className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            ← Back to apps
          </button>
        </div>
        {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : data ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">App details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-500">Name</dt><dd className="font-medium text-gray-900">{safeDisplay(data.name)}</dd></div>
              <div><dt className="text-gray-500">Status</dt><dd className="font-medium text-gray-900">{safeDisplay(data.status) === '—' ? 'active' : safeDisplay(data.status)}</dd></div>
              <div><dt className="text-gray-500">Subdomain</dt><dd className="font-medium text-gray-900">{safeDisplay(data.subDomain)}</dd></div>
              <div><dt className="text-gray-500">Fallback URL</dt><dd className="font-medium text-gray-900 break-all">{safeDisplay(data.fallbackUrl)}</dd></div>
              <div><dt className="text-gray-500">Link count</dt><dd className="font-medium text-gray-900">{typeof data.linkCount === 'number' ? data.linkCount : safeDisplay(data.linkCount)}</dd></div>
              <div><dt className="text-gray-500">Created</dt><dd className="font-medium text-gray-900">{data.createdAt && typeof data.createdAt !== 'object' ? (new Date(data.createdAt).toLocaleString()) : safeDisplay(data.createdAt)}</dd></div>
              <div><dt className="text-gray-500">Updated</dt><dd className="font-medium text-gray-900">{data.updatedAt && typeof data.updatedAt !== 'object' ? (new Date(data.updatedAt).toLocaleString()) : safeDisplay(data.updatedAt)}</dd></div>
              <div><dt className="text-gray-500">Domain ID</dt><dd className="font-medium text-gray-900">{safeDisplay(data.domainId)}</dd></div>
            </dl>
            {data.createdBy && typeof data.createdBy === 'object' && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Created by</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div><dt className="text-gray-500">Email</dt><dd className="font-medium text-gray-900">{safeDisplay(data.createdBy.email)}</dd></div>
                  <div><dt className="text-gray-500">Username</dt><dd className="font-medium text-gray-900">{safeDisplay(data.createdBy.username)}</dd></div>
                </dl>
              </div>
            )}
            {(data.configurations?.android || data.configurations?.ios) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Configurations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {data.configurations?.android && typeof data.configurations.android === 'object' && (
                    <div className="border border-gray-200 rounded-lg p-3">
                      <h4 className="font-medium text-gray-800 mb-2">Android</h4>
                      <dl className="space-y-1">
                        <div><dt className="text-gray-500">Package name</dt><dd className="font-medium text-gray-900">{safeDisplay(data.configurations.android.packageName)}</dd></div>
                        <div><dt className="text-gray-500">Fingerprints</dt><dd className="font-medium text-gray-900 break-all">{(data.configurations.android.fingerPrints || []).length ? (data.configurations.android.fingerPrints || []).map((fp, i) => <span key={i} className="block">{safeDisplay(fp)}</span>) : safeDisplay(null)}</dd></div>
                      </dl>
                    </div>
                  )}
                  {data.configurations?.ios && typeof data.configurations.ios === 'object' && (
                    <div className="border border-gray-200 rounded-lg p-3">
                      <h4 className="font-medium text-gray-800 mb-2">iOS</h4>
                      <dl className="space-y-1">
                        <div><dt className="text-gray-500">Team ID</dt><dd className="font-medium text-gray-900">{safeDisplay(data.configurations.ios.teamId)}</dd></div>
                        <div><dt className="text-gray-500">Bundle ID</dt><dd className="font-medium text-gray-900">{safeDisplay(data.configurations.ios.bundleId)}</dd></div>
                        <div><dt className="text-gray-500">Store ID</dt><dd className="font-medium text-gray-900">{safeDisplay(data.configurations.ios.storeId)}</dd></div>
                      </dl>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : !loading && !error && <p className="text-gray-500">App not found.</p>}
      </div>
    </main>
  );
};

/**
 * View single link: full details (admin).
 */
const AdminLinkView = ({ linkId: linkIdProp }) => {
  const navigate = useNavigate();
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const id = linkIdProp;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getAdminLink(id)
      .then((res) => setLink(res?.link != null ? res.link : res))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (!id) {
    navigate('/admin/links');
    return null;
  }

  const handleDelete = async () => {
    if (!window.confirm('Delete this link?')) return;
    setDeleting(true);
    try {
      await deleteAdminLink(id);
      navigate('/admin/links');
    } catch (err) {
      setError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const data = link;
  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3 flex-wrap">
          <button type="button" onClick={() => navigate('/admin/links')} className="text-sm text-gray-600 hover:text-gray-900 font-medium">
            ← Back to links
          </button>
          {data && (
            <button type="button" onClick={handleDelete} disabled={deleting} className="text-sm text-red-600 hover:underline disabled:opacity-50 ml-auto">
              {deleting ? 'Deleting…' : 'Delete link'}
            </button>
          )}
        </div>
        {error && <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : data ? (
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-semibold text-gray-900">Link details</h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div><dt className="text-gray-500">Link name</dt><dd className="font-medium text-gray-900">{safeDisplay(data.linkName)}</dd></div>
              <div><dt className="text-gray-500">Path</dt><dd className="font-medium text-gray-900 font-mono break-all">{safeDisplay(data.path)}</dd></div>
              <div className="sm:col-span-2"><dt className="text-gray-500">Destination URL</dt><dd className="font-medium text-gray-900 break-all">{safeDisplay(data.destinationUrl)}</dd></div>
              <div><dt className="text-gray-500">Android behavior</dt><dd className="font-medium text-gray-900">{safeDisplay(data.androidBehavior)}</dd></div>
              <div><dt className="text-gray-500">iOS behavior</dt><dd className="font-medium text-gray-900">{safeDisplay(data.iosBehavior)}</dd></div>
              <div><dt className="text-gray-500">Created</dt><dd className="font-medium text-gray-900">{data.createdAt && typeof data.createdAt !== 'object' ? new Date(data.createdAt).toLocaleString() : safeDisplay(data.createdAt)}</dd></div>
              <div><dt className="text-gray-500">Updated</dt><dd className="font-medium text-gray-900">{data.updatedAt && typeof data.updatedAt !== 'object' ? new Date(data.updatedAt).toLocaleString() : safeDisplay(data.updatedAt)}</dd></div>
            </dl>
            {data.appId && typeof data.appId === 'object' && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">App</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div><dt className="text-gray-500">Name</dt><dd className="font-medium text-gray-900">{safeDisplay(data.appId.name)}</dd></div>
                  <div><dt className="text-gray-500">Subdomain</dt><dd className="font-medium text-gray-900">{safeDisplay(data.appId.subDomain)}</dd></div>
                  <div><dt className="text-gray-500">Fallback URL</dt><dd className="font-medium text-gray-900 break-all">{safeDisplay(data.appId.fallbackUrl)}</dd></div>
                  <div><dt className="text-gray-500">Status</dt><dd className="font-medium text-gray-900">{safeDisplay(data.appId.status)}</dd></div>
                </dl>
              </div>
            )}
            {data.utm && typeof data.utm === 'object' && (data.utm.source || data.utm.medium || data.utm.previewTitle || data.utm.campaignName) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">UTM / Preview</h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  {data.utm.source != null && <div><dt className="text-gray-500">Source</dt><dd className="font-medium text-gray-900">{safeDisplay(data.utm.source)}</dd></div>}
                  {data.utm.medium != null && <div><dt className="text-gray-500">Medium</dt><dd className="font-medium text-gray-900">{safeDisplay(data.utm.medium)}</dd></div>}
                  {data.utm.previewTitle != null && <div><dt className="text-gray-500">Preview title</dt><dd className="font-medium text-gray-900">{safeDisplay(data.utm.previewTitle)}</dd></div>}
                  {data.utm.previewDescription != null && <div><dt className="text-gray-500">Preview description</dt><dd className="font-medium text-gray-900">{safeDisplay(data.utm.previewDescription)}</dd></div>}
                  {data.utm.previewImageUrl != null && <div className="sm:col-span-2"><dt className="text-gray-500">Preview image</dt><dd className="font-medium text-gray-900 break-all">{safeDisplay(data.utm.previewImageUrl)}</dd></div>}
                  {data.utm.campaignName != null && <div><dt className="text-gray-500">Campaign name</dt><dd className="font-medium text-gray-900">{safeDisplay(data.utm.campaignName)}</dd></div>}
                  {data.utm.campaignSource != null && <div><dt className="text-gray-500">Campaign source</dt><dd className="font-medium text-gray-900">{safeDisplay(data.utm.campaignSource)}</dd></div>}
                  {data.utm.campaignMedium != null && <div><dt className="text-gray-500">Campaign medium</dt><dd className="font-medium text-gray-900">{safeDisplay(data.utm.campaignMedium)}</dd></div>}
                  {data.utm.campaignTerm != null && <div><dt className="text-gray-500">Campaign term</dt><dd className="font-medium text-gray-900">{safeDisplay(data.utm.campaignTerm)}</dd></div>}
                  {data.utm.campaignContent != null && <div><dt className="text-gray-500">Campaign content</dt><dd className="font-medium text-gray-900">{safeDisplay(data.utm.campaignContent)}</dd></div>}
                </dl>
              </div>
            )}
          </div>
        ) : !loading && !error && <p className="text-gray-500">Link not found.</p>}
      </div>
    </main>
  );
};

/**
 * Admin pricing: list plans from PricingPlans model, create/edit/delete.
 */
const AdminPricing = () => {
  const [data, setData] = useState({ plans: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState({
    title: '',
    price: 0,
    discountedPrice: 0,
    benefits: [],
    notIncludedBenefits: [],
    isPopular: false,
    isActive: true,
  });
  const [benefitsText, setBenefitsText] = useState('');
  const [notIncludedText, setNotIncludedText] = useState('');

  const fetchPlans = (page = 1) => {
    setLoading(true);
    getAdminPlans({ page, limit: 20, search })
      .then((res) => setData({
        plans: res.plans || [],
        total: res.total || 0,
        page: res.page || 1,
        limit: res.limit || 20,
        totalPages: res.totalPages || 0,
      }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPlans(1);
  }, [search]);

  const openCreate = () => {
    setEditingPlan(null);
    setForm({ title: '', price: 0, discountedPrice: 0, benefits: [], notIncludedBenefits: [], isPopular: false, isActive: true });
    setBenefitsText('');
    setNotIncludedText('');
    setModalOpen(true);
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    setForm({
      title: plan.title || '',
      price: typeof plan.price === 'number' ? plan.price : Number(plan.price) || 0,
      discountedPrice: typeof plan.discountedPrice === 'number' ? plan.discountedPrice : Number(plan.discountedPrice) || 0,
      benefits: Array.isArray(plan.benefits) ? [...plan.benefits] : [],
      notIncludedBenefits: Array.isArray(plan.notIncludedBenefits) ? [...plan.notIncludedBenefits] : [],
      isPopular: Boolean(plan.isPopular),
      isActive: plan.isActive !== undefined ? Boolean(plan.isActive) : true,
    });
    setBenefitsText(Array.isArray(plan.benefits) ? plan.benefits.join('\n') : '');
    setNotIncludedText(Array.isArray(plan.notIncludedBenefits) ? plan.notIncludedBenefits.join('\n') : '');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingPlan(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const benefits = benefitsText.trim() ? benefitsText.split('\n').map((s) => s.trim()).filter(Boolean) : [];
    const notIncludedBenefits = notIncludedText.trim() ? notIncludedText.split('\n').map((s) => s.trim()).filter(Boolean) : [];
    const payload = {
      title: form.title.trim(),
      price: Number(form.price) || 0,
      discountedPrice: Number(form.discountedPrice) || 0,
      benefits,
      notIncludedBenefits,
      isPopular: form.isPopular,
      isActive: form.isActive,
    };
    try {
      if (editingPlan) {
        await updateAdminPlan(editingPlan._id, payload);
      } else {
        await createAdminPlan(payload);
      }
      closeModal();
      fetchPlans(data.page);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this plan?')) return;
    setDeletingId(id);
    try {
      await deleteAdminPlan(id);
      fetchPlans(data.page);
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
            <h2 className="text-lg font-semibold text-gray-900">Pricing plans</h2>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Search by title..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput)}
                className="flex-1 min-w-[140px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button type="button" onClick={() => setSearch(searchInput)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">
                Search
              </button>
              <button type="button" onClick={openCreate} className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800">
                Create plan
              </button>
            </div>
          </div>
          {error && <div className="p-4 bg-red-50 text-red-700 text-sm">{error}</div>}
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discounted</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Popular</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(data.plans || []).map((plan) => (
                      <tr key={plan._id} className="bg-white hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{plan.title || '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{plan.price != null ? plan.price : '—'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{plan.discountedPrice != null ? plan.discountedPrice : '—'}</td>
                        <td className="px-4 py-3 text-sm">{plan.isPopular ? <span className="text-green-600">Yes</span> : <span className="text-gray-400">No</span>}</td>
                        <td className="px-4 py-3 text-sm">{plan.isActive !== false ? <span className="text-green-600">Yes</span> : <span className="text-gray-400">No</span>}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <button type="button" onClick={() => openEdit(plan)} className="text-sm text-primary hover:underline">Edit</button>
                          <button type="button" onClick={() => handleDelete(plan._id)} disabled={deletingId === plan._id} className="text-sm text-red-600 hover:underline disabled:opacity-50">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.plans.length === 0 && !loading && <p className="p-4 text-sm text-gray-500">No plans yet. Create one to get started.</p>}
              {data.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                  <span>Page {data.page} of {data.totalPages} ({data.total} total)</span>
                  <div className="flex gap-2">
                    <button type="button" disabled={data.page <= 1} onClick={() => fetchPlans(data.page - 1)} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50">Previous</button>
                    <button type="button" disabled={data.page >= data.totalPages} onClick={() => fetchPlans(data.page + 1)} className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50">Next</button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">{editingPlan ? 'Edit plan' : 'Create plan'}</h3>
              <button type="button" onClick={closeModal} className="p-1 rounded hover:bg-gray-100 text-gray-600">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                  <input type="number" min={0} step={0.01} required value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Discounted price</label>
                  <input type="number" min={0} step={0.01} value={form.discountedPrice} onChange={(e) => setForm((f) => ({ ...f, discountedPrice: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Benefits (one per line)</label>
                <textarea value={benefitsText} onChange={(e) => setBenefitsText(e.target.value)} rows={4} placeholder="Feature one&#10;Feature two" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Not included (one per line)</label>
                <textarea value={notIncludedText} onChange={(e) => setNotIncludedText(e.target.value)} rows={2} placeholder="Optional" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm((f) => ({ ...f, isPopular: e.target.checked }))} className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-sm text-gray-700">Popular</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="rounded border-gray-300 text-primary focus:ring-primary" />
                  <span className="text-sm text-gray-700">Active (visible on site)</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeModal} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50">{saving ? 'Saving…' : (editingPlan ? 'Update' : 'Create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

/**
 * Placeholder for Settings.
 */
const AdminSettings = () => (
  <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
        <p className="text-gray-600 mt-2">Admin configuration will be implemented here.</p>
      </div>
    </div>
  </main>
);

/**
 * Admin Support: list conversations, view thread, reply as support.
 */
const normalizeMessage = (m) => ({
  id: m.id || m._id?.toString(),
  from: m.from || (m.fromSupport ? 'support' : 'user'),
  text: m.text,
  time: m.time || m.createdAt,
  deliveredAt: m.deliveredAt ?? null,
  readAt: m.readAt ?? null,
});

const AdminSupport = () => {
  const { socket } = useChatSocket();
  const messagesEndRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const selectedConv = conversations.find((c) => c.userId === selectedUserId);

  // Auto-scroll to last message when messages or loading state changes
  useEffect(() => {
    if (loadingMessages) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingMessages]);

  useEffect(() => {
    setError(null);
    getAdminChatConversations()
      .then((data) => setConversations(data.conversations || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingConvs(false));
  }, []);

  useEffect(() => {
    if (!selectedUserId) {
      setMessages([]);
      return;
    }
    setLoadingMessages(true);
    setError(null);
    getAdminChatMessages(selectedUserId)
      .then((data) => setMessages((data.messages || []).map(normalizeMessage)))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingMessages(false));
  }, [selectedUserId]);

  // Real-time: new message from user (emitted to admins with userId)
  useEffect(() => {
    if (!socket) return;
    const onNewMessage = (payload) => {
      const userId = payload.userId;
      const msg = payload.message;
      if (!userId || !msg) return;
      playNotificationSound();
      if (userId !== selectedUserId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, normalizeMessage(msg)];
      });
    };
    socket.on('new_message', onNewMessage);
    return () => socket.off('new_message', onNewMessage);
  }, [socket, selectedUserId]);

  // Real-time: message status (delivered/read) so admin sees ticks for user messages
  useEffect(() => {
    if (!socket) return;
    const onStatus = (payload) => {
      const { messageId, deliveredAt, readAt } = payload || {};
      if (!messageId) return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, deliveredAt: deliveredAt ?? m.deliveredAt, readAt: readAt ?? m.readAt } : m
        )
      );
    };
    socket.on('message_status', onStatus);
    return () => socket.off('message_status', onStatus);
  }, [socket]);

  const handleSendReply = (e) => {
    e.preventDefault();
    const text = replyText.trim();
    if (!text || !selectedUserId || sending) return;
    setSending(true);
    setError(null);
    sendAdminChatReply(selectedUserId, text)
      .then((data) => {
        const msg = data.message || data;
        setMessages((prev) => [...prev, normalizeMessage({ ...msg, from: 'support' })]);
        setReplyText('');
      })
      .catch((e) => setError(e.message))
      .finally(() => setSending(false));
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-12rem)] min-h-[400px]">
          {/* Conversation list */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden lg:col-span-1">
            <div className="px-4 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loadingConvs ? (
                <div className="p-4 flex justify-center">
                  <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-gray-600 rounded-full" />
                </div>
              ) : conversations.length === 0 ? (
                <p className="p-4 text-sm text-gray-500">No conversations yet.</p>
              ) : (
                conversations.map((c) => (
                  <button
                    key={c.userId}
                    type="button"
                    onClick={() => setSelectedUserId(c.userId)}
                    className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedUserId === c.userId ? 'bg-gray-100 border-l-4 border-l-gray-900' : ''}`}
                  >
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {c.username || c.email || c.userId}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{c.lastMessage}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatTime(c.lastAt)}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Thread + reply */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden lg:col-span-2">
            {!selectedUserId ? (
              <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">
                Select a conversation to view and reply.
              </div>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {selectedConv?.username || selectedConv?.email || selectedUserId}
                  </span>
                </div>
                {error && (
                  <div className="mx-4 mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
                )}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingMessages ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin h-6 w-6 border-2 border-gray-300 border-t-gray-600 rounded-full" />
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.from === 'support' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                              msg.from === 'support'
                                ? 'bg-gray-900 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p>{msg.text}</p>
                            <div className="flex items-center gap-1.5 mt-1 justify-end">
                              <span className={`text-[10px] ${msg.from === 'support' ? 'text-gray-300' : 'text-gray-500'}`}>
                                {formatTime(msg.time)}
                              </span>
                              {msg.from === 'support' && (
                                <span className="flex items-center" title={msg.readAt ? 'Read by user' : msg.deliveredAt ? 'Delivered to user' : 'Sent'}>
                                  {msg.readAt ? (
                                    <AdminDoubleTickIcon className="w-3.5 h-3.5 text-blue-400" />
                                  ) : msg.deliveredAt ? (
                                    <AdminDoubleTickIcon className="w-3.5 h-3.5 text-gray-400" />
                                  ) : (
                                    <AdminSingleTickIcon className="w-3.5 h-3.5 text-gray-400" />
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>
                <form onSubmit={handleSendReply} className="p-4 border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={sending || !replyText.trim()}
                      className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black disabled:opacity-50"
                    >
                      {sending ? 'Sending…' : 'Send'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

const AdminSingleTickIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 16 15" fill="currentColor">
    <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.266c.143.14.361.125.465-.033l2.046-2.77a.365.365 0 0 0-.063-.51z" />
  </svg>
);
const AdminDoubleTickIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 16 15" fill="currentColor">
    <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.266c.143.14.361.125.465-.033l2.046-2.77a.365.365 0 0 0-.063-.51zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185c.143.14.361.125.465-.033l2.046-2.77a.365.365 0 0 0-.063-.51z" />
  </svg>
);

/**
 * Admin dashboard router: /admin, /admin/users, /admin/apps, /admin/settings
 */
export const AdminDashboard = () => {
  const location = useLocation();
  const pathSegments = location.pathname.replace(/^\/admin\/?/, '').split('/').filter(Boolean);
  const path = pathSegments[0] || 'overview';
  const userId = pathSegments[0] === 'users' && pathSegments[1] ? pathSegments[1] : null;
  const appId = pathSegments[0] === 'apps' && pathSegments[1] ? pathSegments[1] : null;
  const linkId = pathSegments[0] === 'links' && pathSegments[1] ? pathSegments[1] : null;

  const getContent = () => {
    if (path === 'users' && userId) {
      return (
        <AdminLayout title="View user" subtitle="User details">
          <AdminUserView userId={userId} />
        </AdminLayout>
      );
    }
    if (path === 'apps' && appId) {
      return (
        <AdminLayout title="View app" subtitle="App details">
          <AdminAppView appId={appId} />
        </AdminLayout>
      );
    }
    if (path === 'links' && linkId) {
      return (
        <AdminLayout title="View link" subtitle="Link details">
          <AdminLinkView linkId={linkId} />
        </AdminLayout>
      );
    }
    switch (path) {
      case 'users':
        return (
          <AdminLayout title="Users" subtitle="Manage users">
            <AdminUsers />
          </AdminLayout>
        );
      case 'apps':
        return (
          <AdminLayout title="Apps" subtitle="All applications">
            <AdminApps />
          </AdminLayout>
        );
      case 'links':
        return (
          <AdminLayout title="Links" subtitle="All deep links">
            <AdminLinks />
          </AdminLayout>
        );
      case 'affiliates':
        return (
          <AdminLayout title="Affiliates" subtitle="Affiliate signups">
            <AdminAffiliates />
          </AdminLayout>
        );
      case 'pricing':
        return (
          <AdminLayout title="Pricing" subtitle="Manage pricing plans">
            <AdminPricing />
          </AdminLayout>
        );
      case 'settings':
        return (
          <AdminLayout title="Settings" subtitle="Admin settings">
            <AdminSettings />
          </AdminLayout>
        );
      case 'support':
        return (
          <AdminLayout title="Support" subtitle="Reply to user chats">
            <AdminSupport />
          </AdminLayout>
        );
      case 'overview':
      default:
        return (
          <AdminLayout title="Admin" subtitle="Overview">
            <AdminOverview />
          </AdminLayout>
        );
    }
  };

  return (
    <>
      <PageMeta title={META.title} description={META.description} path={location.pathname} noIndex />
      {getContent()}
    </>
  );
};

export default AdminDashboard;

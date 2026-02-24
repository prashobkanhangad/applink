/**
 * Admin API service.
 * All endpoints require admin role (enforced by backend).
 */

import { handleAuthFailure } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const getAuthToken = () => localStorage.getItem('authToken');

const adminFetch = async (path, options = {}) => {
  const token = getAuthToken();
  if (!token) {
    handleAuthFailure('Please sign in to continue.');
    throw new Error('Authentication required.');
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  if (res.status === 401 || res.status === 403) {
    const data = await res.json().catch(() => ({}));
    if (res.status === 403) {
      window.location.href = '/dashboard';
      throw new Error(data.message || 'Admin access required');
    }
    handleAuthFailure(data.message || 'Session expired.');
    throw new Error(data.message || 'Unauthorized');
  }
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Request failed: ${res.statusText}`);
  }
  return res.json();
};

/**
 * GET /admin/stats
 */
export const getAdminStats = async () => {
  const data = await adminFetch('/admin/stats');
  return data.data || data;
};

/**
 * GET /admin/users?page=1&limit=20&search=
 */
export const getAdminUsers = async ({ page = 1, limit = 20, search = '' } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set('search', search);
  const data = await adminFetch(`/admin/users?${params}`);
  return data.data || data;
};

/**
 * GET /admin/apps?page=1&limit=20&search=
 */
export const getAdminApps = async ({ page = 1, limit = 20, search = '' } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set('search', search);
  const data = await adminFetch(`/admin/apps?${params}`);
  return data.data || data;
};

/**
 * GET /admin/apps/:id
 */
export const getAdminApp = async (appId) => {
  const data = await adminFetch(`/admin/apps/${appId}`);
  return data.data || data;
};

/**
 * GET /admin/users/:id
 */
export const getAdminUser = async (userId) => {
  const data = await adminFetch(`/admin/users/${userId}`);
  return data.data || data;
};
export const updateUserRole = async (userId, role) => {
  const data = await adminFetch(`/admin/users/${userId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  });
  return data.data || data;
};

/**
 * GET /admin/plans?page=1&limit=20&search=
 */
export const getAdminPlans = async ({ page = 1, limit = 20, search = '' } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set('search', search);
  const data = await adminFetch(`/admin/plans?${params}`);
  return data.data || data;
};

/**
 * GET /admin/plans/:id
 */
export const getAdminPlan = async (planId) => {
  const data = await adminFetch(`/admin/plans/${planId}`);
  return data.data || data;
};

/**
 * POST /admin/plans
 */
export const createAdminPlan = async (payload) => {
  const data = await adminFetch('/admin/plans', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.data || data;
};

/**
 * PATCH /admin/plans/:id
 */
export const updateAdminPlan = async (planId, payload) => {
  const data = await adminFetch(`/admin/plans/${planId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return data.data || data;
};

/**
 * DELETE /admin/plans/:id
 */
export const deleteAdminPlan = async (planId) => {
  const data = await adminFetch(`/admin/plans/${planId}`, { method: 'DELETE' });
  return data.data || data;
};

/**
 * GET /admin/links?page=1&limit=20&search=&appId=
 */
export const getAdminLinks = async ({ page = 1, limit = 20, search = '', appId = '' } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set('search', search);
  if (appId) params.set('appId', appId);
  const data = await adminFetch(`/admin/links?${params}`);
  return data.data || data;
};

/**
 * GET /admin/links/:id
 */
export const getAdminLink = async (linkId) => {
  const data = await adminFetch(`/admin/links/${linkId}`);
  return data.data || data;
};

/**
 * DELETE /admin/links/:id
 */
export const deleteAdminLink = async (linkId) => {
  const data = await adminFetch(`/admin/links/${linkId}`, { method: 'DELETE' });
  return data.data || data;
};

/**
 * GET /admin/affiliates?page=1&limit=20&search=
 */
export const getAdminAffiliates = async ({ page = 1, limit = 20, search = '' } = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.set('search', search);
  const data = await adminFetch(`/admin/affiliates?${params}`);
  return data.data || data;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const blogFetch = async (path) => {
  const res = await fetch(`${API_BASE_URL}${path}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Request failed: ${res.status}`);
  }
  return res.json();
};

/** GET /blog?page=1&limit=20 */
export const listBlogPosts = async ({ page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams({ page, limit });
  const data = await blogFetch(`/blog?${params}`);
  return data;
};

/** GET /blog/:slug */
export const getBlogPostBySlug = async (slug) => {
  const data = await blogFetch(`/blog/${encodeURIComponent(slug)}`);
  return data.post || data;
};

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  getAdminBlogPosts,
  getAdminBlogPost,
  createAdminBlogPost,
  updateAdminBlogPost,
  deleteAdminBlogPost,
  toggleAdminBlogPostStatus,
} from '../../services/adminService';

/* ─── helpers ──────────────────────────────────────────────────────────────── */

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .slice(0, 100);

const fmtDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

const EMPTY_FORM = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  icon: '📝',
  author: 'Deeplink Team',
  tags: '',
  status: 'draft',
  readTime: '5 min read',
  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  datePublished: '',
  faqsText: '',
};

/* ─── FAQ parser ────────────────────────────────────────────────────────────── */
// Expects blocks like:
// Q: What is X?
// A: Answer text.
const parseFaqs = (text = '') => {
  const items = [];
  const blocks = text.trim().split(/\n(?=Q:)/i);
  for (const block of blocks) {
    const qMatch = block.match(/^Q:\s*(.+)/i);
    const aMatch = block.match(/A:\s*([\s\S]+)/i);
    if (qMatch && aMatch) {
      items.push({ question: qMatch[1].trim(), answer: aMatch[1].trim() });
    }
  }
  return items;
};

const faqsToText = (faqs = []) =>
  faqs.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n');

/* ─── Markdown preview ──────────────────────────────────────────────────────── */
const MarkdownPreview = ({ content }) => (
  <div className="prose prose-sm max-w-none text-gray-800">
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => <h1 className="text-2xl font-bold mt-4 mb-2">{children}</h1>,
        h2: ({ children }) => <h2 className="text-xl font-semibold mt-4 mb-2 border-b border-gray-200 pb-1">{children}</h2>,
        h3: ({ children }) => <h3 className="text-lg font-semibold mt-3 mb-1">{children}</h3>,
        p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
        ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
        ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        code: ({ inline, children }) =>
          inline ? (
            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
          ) : (
            <code className="block bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono overflow-x-auto my-2 whitespace-pre">
              {children}
            </code>
          ),
        pre: ({ children }) => <pre className="my-2 rounded overflow-hidden">{children}</pre>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-blue-400 pl-3 my-3 text-gray-600 italic bg-blue-50 py-1 rounded-r">
            {children}
          </blockquote>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-3">
            <table className="min-w-full border border-gray-200 text-xs">{children}</table>
          </div>
        ),
        thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
        tbody: ({ children }) => <tbody className="divide-y divide-gray-200">{children}</tbody>,
        tr: ({ children }) => <tr>{children}</tr>,
        th: ({ children }) => <th className="px-3 py-2 font-semibold text-left border-b border-gray-200">{children}</th>,
        td: ({ children }) => <td className="px-3 py-2 align-top">{children}</td>,
        a: ({ href, children }) => <a href={href} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{children}</a>,
        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
      }}
    >
      {content}
    </ReactMarkdown>
  </div>
);

/* ─── Blog List ─────────────────────────────────────────────────────────────── */
const AdminBlogList = ({ onEdit, onNew }) => {
  const [data, setData] = useState({ posts: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [togglingId, setTogglingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchPosts = useCallback(
    (page = 1) => {
      setLoading(true);
      getAdminBlogPosts({ page, limit: 20, search, status: statusFilter })
        .then((res) =>
          setData({
            posts: res.posts || [],
            total: res.total || 0,
            page: res.page || 1,
            limit: res.limit || 20,
            totalPages: res.totalPages || 0,
          })
        )
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    },
    [search, statusFilter]
  );

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const handleToggle = async (id) => {
    setTogglingId(id);
    try {
      const res = await toggleAdminBlogPostStatus(id);
      setData((prev) => ({
        ...prev,
        posts: prev.posts.map((p) => (p._id === id ? { ...p, status: res.status } : p)),
      }));
    } catch (e) {
      setError(e.message);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post permanently?')) return;
    setDeletingId(id);
    try {
      await deleteAdminBlogPost(id);
      fetchPosts(data.page);
    } catch (e) {
      setError(e.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center flex-wrap">
            <h2 className="text-lg font-semibold text-gray-900">Blog posts</h2>
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Search by title..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearch(searchInput)}
                className="flex-1 min-w-[160px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <button
                type="button"
                onClick={() => setSearch(searchInput)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Search
              </button>
              <button
                type="button"
                onClick={onNew}
                className="px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800"
              >
                + New post
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Published</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Read time</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(data.posts || []).map((post) => (
                      <tr key={post._id} className="bg-white hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 max-w-[240px]">
                          <button
                            type="button"
                            onClick={() => onEdit(post._id)}
                            className="text-left text-primary hover:underline font-medium truncate block w-full"
                            title={post.title}
                          >
                            {post.icon && <span className="mr-1">{post.icon}</span>}
                            {post.title}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 font-mono truncate max-w-[180px]" title={post.slug}>
                          {post.slug}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              post.status === 'published'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {post.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{fmtDate(post.datePublished)}</td>
                        <td className="px-4 py-3 text-sm text-gray-500">{post.readTime || '—'}</td>
                        <td className="px-4 py-3 text-sm flex items-center gap-3 flex-wrap">
                          <button
                            type="button"
                            onClick={() => onEdit(post._id)}
                            className="text-primary hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggle(post._id)}
                            disabled={togglingId === post._id}
                            className="text-gray-600 hover:underline disabled:opacity-50"
                          >
                            {post.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:underline"
                          >
                            View
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDelete(post._id)}
                            disabled={deletingId === post._id}
                            className="text-red-600 hover:underline disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {data.posts.length === 0 && !loading && (
                <p className="p-4 text-sm text-gray-500">
                  No posts yet.{' '}
                  <button type="button" onClick={onNew} className="text-primary hover:underline">
                    Create the first one.
                  </button>
                </p>
              )}

              {data.totalPages > 1 && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                  <span>
                    Page {data.page} of {data.totalPages} ({data.total} total)
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={data.page <= 1}
                      onClick={() => fetchPosts(data.page - 1)}
                      className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      disabled={data.page >= data.totalPages}
                      onClick={() => fetchPosts(data.page + 1)}
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

/* ─── Blog Editor ───────────────────────────────────────────────────────────── */
const AdminBlogEditor = ({ postId, onBack, onSaved }) => {
  const navigate = useNavigate();
  const isNew = !postId;
  const [form, setForm] = useState(EMPTY_FORM);
  const [loadingPost, setLoadingPost] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('content');
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (isNew) return;
    setLoadingPost(true);
    getAdminBlogPost(postId)
      .then(({ post }) => {
        setForm({
          title: post.title || '',
          slug: post.slug || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          icon: post.icon || '📝',
          author: post.author || 'Deeplink Team',
          tags: Array.isArray(post.tags) ? post.tags.join(', ') : '',
          status: post.status || 'draft',
          readTime: post.readTime || '5 min read',
          metaTitle: post.metaTitle || '',
          metaDescription: post.metaDescription || '',
          metaKeywords: post.metaKeywords || '',
          datePublished: post.datePublished ? new Date(post.datePublished).toISOString().split('T')[0] : '',
          faqsText: faqsToText(post.faqs),
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoadingPost(false));
  }, [postId, isNew]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleTitleChange = (val) => {
    setForm((f) => ({
      ...f,
      title: val,
      slug: f.slug || isNew ? slugify(val) : f.slug,
      metaTitle: f.metaTitle || isNew ? val : f.metaTitle,
    }));
  };

  const handleExcerptChange = (val) => {
    setForm((f) => ({
      ...f,
      excerpt: val,
      metaDescription: f.metaDescription || isNew ? val : f.metaDescription,
    }));
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    slug: form.slug.trim(),
    excerpt: form.excerpt.trim(),
    content: form.content,
    icon: form.icon.trim(),
    author: form.author.trim(),
    tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    status: form.status,
    readTime: form.readTime.trim(),
    metaTitle: (form.metaTitle || form.title).trim(),
    metaDescription: (form.metaDescription || form.excerpt).trim(),
    metaKeywords: form.metaKeywords.trim(),
    datePublished: form.datePublished || undefined,
    faqs: parseFaqs(form.faqsText),
  });

  const handleSave = async (publishNow = false) => {
    const payload = buildPayload();
    if (publishNow) payload.status = 'published';
    if (!payload.title) { setError('Title is required'); return; }
    if (!payload.content) { setError('Content is required'); return; }
    if (!payload.excerpt) { setError('Excerpt is required'); return; }

    setSaving(true);
    setError(null);
    try {
      if (isNew) {
        await createAdminBlogPost(payload);
      } else {
        await updateAdminBlogPost(postId, payload);
      }
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loadingPost) {
    return (
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 flex justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mt-12" />
      </main>
    );
  }

  const tabs = [
    { id: 'content', label: 'Content' },
    { id: 'seo', label: 'SEO' },
    { id: 'faqs', label: 'FAQs' },
  ];

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Top bar */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            ← Back to posts
          </button>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${form.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
              {form.status}
            </span>
            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save draft'}
            </button>
            {form.status !== 'published' && (
              <button
                type="button"
                onClick={() => handleSave(true)}
                disabled={saving}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? 'Publishing…' : 'Publish'}
              </button>
            )}
            {form.status === 'published' && (
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
              >
                {saving ? 'Updating…' : 'Update post'}
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Main editing area */}
          <div className="xl:col-span-2 space-y-4">
            {/* Title */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <input
                type="text"
                placeholder="Post title…"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full text-2xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none resize-none"
              />
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-400">slug:</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => set('slug', e.target.value)}
                  className="flex-1 text-xs text-gray-500 font-mono border-none outline-none focus:ring-1 focus:ring-primary rounded px-1"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="border-b border-gray-200 flex items-center gap-0">
                {tabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setActiveTab(t.id)}
                    className={`px-5 py-3 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === t.id
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
                {activeTab === 'content' && (
                  <button
                    type="button"
                    onClick={() => setPreviewMode((p) => !p)}
                    className="ml-auto mr-3 px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {previewMode ? 'Edit' : 'Preview'}
                  </button>
                )}
              </div>

              {/* Content tab */}
              {activeTab === 'content' && (
                <div>
                  {previewMode ? (
                    <div className="p-6 min-h-[480px] overflow-y-auto">
                      {form.content ? (
                        <MarkdownPreview content={form.content} />
                      ) : (
                        <p className="text-gray-400 text-sm">Nothing to preview yet.</p>
                      )}
                    </div>
                  ) : (
                    <textarea
                      value={form.content}
                      onChange={(e) => set('content', e.target.value)}
                      placeholder="Write your post in Markdown…"
                      className="w-full p-5 min-h-[480px] text-sm font-mono text-gray-800 resize-y border-none outline-none focus:ring-0"
                      spellCheck
                    />
                  )}
                  <div className="border-t border-gray-100 px-5 py-2 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Markdown supported. Use ## for headings, **bold**, `code`, and | tables |.</span>
                    <span className="text-xs text-gray-400">{form.content.length} chars</span>
                  </div>
                </div>
              )}

              {/* SEO tab */}
              {activeTab === 'seo' && (
                <div className="p-5 space-y-4">
                  <p className="text-xs text-gray-500">These fields control how the post appears in search engines. Defaults to title and excerpt if left blank.</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta title <span className="text-gray-400 font-normal">(≤60 chars recommended)</span></label>
                    <input
                      type="text"
                      value={form.metaTitle}
                      onChange={(e) => set('metaTitle', e.target.value)}
                      maxLength={100}
                      placeholder={form.title || 'Same as title if blank'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-xs text-gray-400">{(form.metaTitle || form.title).length}/100</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta description <span className="text-gray-400 font-normal">(≤160 chars recommended)</span></label>
                    <textarea
                      value={form.metaDescription}
                      onChange={(e) => set('metaDescription', e.target.value)}
                      maxLength={300}
                      rows={3}
                      placeholder={form.excerpt || 'Same as excerpt if blank'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-xs text-gray-400">{(form.metaDescription || form.excerpt).length}/300</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Meta keywords <span className="text-gray-400 font-normal">(comma-separated)</span></label>
                    <input
                      type="text"
                      value={form.metaKeywords}
                      onChange={(e) => set('metaKeywords', e.target.value)}
                      placeholder="deep linking, mobile, android"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              )}

              {/* FAQs tab */}
              {activeTab === 'faqs' && (
                <div className="p-5 space-y-3">
                  <p className="text-xs text-gray-500">
                    FAQs are injected as <code className="bg-gray-100 px-1 rounded text-xs">FAQPage</code> JSON-LD schema and shown below the post. Format each FAQ as:
                    <br />
                    <code className="bg-gray-100 px-1 rounded text-xs block mt-1 py-1">Q: What is X?<br />A: The answer here.</code>
                    Separate pairs with a blank line.
                  </p>
                  <textarea
                    value={form.faqsText}
                    onChange={(e) => set('faqsText', e.target.value)}
                    rows={14}
                    placeholder={`Q: What is deep linking?\nA: Deep linking routes users to specific in-app content.\n\nQ: Why does it matter?\nA: It improves conversion by preserving user intent.`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  {form.faqsText && (
                    <p className="text-xs text-gray-400">
                      {parseFaqs(form.faqsText).length} FAQ{parseFaqs(form.faqsText).length !== 1 ? 's' : ''} detected
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Excerpt */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">Excerpt / summary</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => handleExcerptChange(e.target.value)}
                rows={3}
                placeholder="A short description shown on the blog listing page and in search results…"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Sidebar settings */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Post settings</h3>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Publish date</label>
                <input
                  type="date"
                  value={form.datePublished}
                  onChange={(e) => set('datePublished', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Icon / emoji</label>
                <input
                  type="text"
                  value={form.icon}
                  onChange={(e) => set('icon', e.target.value)}
                  maxLength={4}
                  placeholder="📝"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Author</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => set('author', e.target.value)}
                  placeholder="Deeplink Team"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Read time</label>
                <input
                  type="text"
                  value={form.readTime}
                  onChange={(e) => set('readTime', e.target.value)}
                  placeholder="5 min read"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tags <span className="font-normal text-gray-400">(comma-separated)</span></label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => set('tags', e.target.value)}
                  placeholder="deep linking, mobile, android"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            {/* Live SEO preview */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">Search preview</h3>
              <div className="space-y-1">
                <p className="text-blue-600 text-sm font-medium leading-tight line-clamp-2">
                  {form.metaTitle || form.title || 'Post title'}
                </p>
                <p className="text-green-700 text-xs">deeplink.in › blog › {form.slug || 'post-slug'}</p>
                <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">
                  {form.metaDescription || form.excerpt || 'Post description will appear here.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

/* ─── Main exported component ───────────────────────────────────────────────── */
export const AdminBlog = () => {
  const [view, setView] = useState('list');
  const [editingId, setEditingId] = useState(null);

  const handleEdit = (id) => {
    setEditingId(id);
    setView('editor');
  };

  const handleNew = () => {
    setEditingId(null);
    setView('editor');
  };

  const handleBack = () => {
    setEditingId(null);
    setView('list');
  };

  const handleSaved = () => {
    setEditingId(null);
    setView('list');
  };

  if (view === 'editor') {
    return <AdminBlogEditor postId={editingId} onBack={handleBack} onSaved={handleSaved} />;
  }

  return <AdminBlogList onEdit={handleEdit} onNew={handleNew} />;
};

export default AdminBlog;

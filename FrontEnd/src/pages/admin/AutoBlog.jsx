import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAutoBlogStatus, getAutoBlogLogs, triggerAutoBlog } from '../../services/adminService';

/* ─── Helpers ────────────────────────────────────────────────────────────────── */
const fmt = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      })
    : '—';

const durFmt = (ms) => {
  if (!ms) return '—';
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.round((ms % 60000) / 1000)}s`;
};

/* ─── Status badge ───────────────────────────────────────────────────────────── */
const Badge = ({ status }) => {
  const map = {
    running:   'bg-blue-100 text-blue-700 border-blue-200',
    completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    failed:    'bg-red-100 text-red-700 border-red-200',
    ok:        'bg-emerald-100 text-emerald-700 border-emerald-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${map[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status === 'running' && (
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5 animate-pulse" />
      )}
      {status}
    </span>
  );
};

/* ─── Log card ───────────────────────────────────────────────────────────────── */
const LogCard = ({ log }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Badge status={log.status} />
          <span className="text-sm font-medium text-gray-700 truncate">
            {fmt(log.startedAt || log.createdAt)}
          </span>
          <span className="hidden sm:inline text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded-full">
            {log.triggeredBy}
          </span>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0 ml-4">
          <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500">
            <span className="text-emerald-600 font-semibold">{log.postsCreated ?? 0} created</span>
            {log.postsFailed > 0 && (
              <span className="text-red-500 font-semibold">{log.postsFailed} failed</span>
            )}
            <span>{durFmt(log.durationMs)}</span>
          </div>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/50">
          {log.error && (
            <p className="text-sm text-red-600 mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {log.error}
            </p>
          )}
          {Array.isArray(log.posts) && log.posts.length > 0 ? (
            <div className="space-y-2">
              {log.posts.map((p, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <Badge status={p.status} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{p.title || '—'}</p>
                    {p.slug && (
                      <Link
                        to={`/blog/${p.slug}`}
                        target="_blank"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        /blog/{p.slug}
                      </Link>
                    )}
                    {p.error && <p className="text-xs text-red-500 mt-0.5">{p.error}</p>}
                  </div>
                  {p.coverImage && (
                    <img
                      src={p.coverImage}
                      alt=""
                      className="w-16 h-9 object-cover rounded border border-gray-200 flex-shrink-0"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400">No post details recorded.</p>
          )}
        </div>
      )}
    </div>
  );
};

/* ─── Main component ─────────────────────────────────────────────────────────── */
export const AdminAutoBlog = () => {
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [triggerMsg, setTriggerMsg] = useState(null);
  const [count, setCount] = useState(5);
  const [pollInterval, setPollInterval] = useState(null);

  const fetchStatus = useCallback(async () => {
    try {
      const s = await getAutoBlogStatus();
      setStatus(s);
    } catch {
      // ignore
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    try {
      const l = await getAutoBlogLogs(20);
      setLogs(Array.isArray(l) ? l : []);
    } catch {
      // ignore
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchLogs();
  }, [fetchStatus, fetchLogs]);

  // Poll every 10s when a run is in progress
  useEffect(() => {
    if (status?.running) {
      const id = setInterval(() => {
        fetchStatus();
        fetchLogs();
      }, 10000);
      setPollInterval(id);
      return () => clearInterval(id);
    } else {
      if (pollInterval) {
        clearInterval(pollInterval);
        setPollInterval(null);
      }
    }
  }, [status?.running]);

  const handleTrigger = async () => {
    if (triggering) return;
    setTriggering(true);
    setTriggerMsg(null);
    try {
      const res = await triggerAutoBlog(count);
      setTriggerMsg({ type: 'ok', text: res.message || 'Generation started!' });
      setTimeout(() => {
        fetchStatus();
        fetchLogs();
      }, 1500);
    } catch (err) {
      setTriggerMsg({ type: 'err', text: err.message });
    } finally {
      setTriggering(false);
    }
  };

  const isRunning = !!status?.running;

  return (
    <div className="space-y-6">
      {/* ── Stats row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Status"
          value={isRunning ? 'Running…' : 'Idle'}
          sub={isRunning ? `Started ${fmt(status.running.startedAt)}` : 'No active run'}
          accent={isRunning ? 'blue' : 'gray'}
          loading={loadingStatus}
        />
        <StatCard
          label="Last Run"
          value={status?.latest ? fmt(status.latest.startedAt || status.latest.createdAt) : '—'}
          sub={status?.latest ? `${status.latest.postsCreated ?? 0} posts created` : 'Never run'}
          accent="gray"
          loading={loadingStatus}
        />
        <StatCard
          label="Total Runs"
          value={logs.length}
          sub="Stored in logs"
          accent="gray"
          loading={loadingLogs}
        />
      </div>

      {/* ── Manual trigger card ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-gray-900">Manual Generation</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Trigger a run now. The cron job also runs automatically daily at 6:30 AM IST.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600 font-medium">Posts:</label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                disabled={isRunning || triggering}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 disabled:opacity-50"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleTrigger}
              disabled={isRunning || triggering}
              className="flex items-center gap-2 px-5 py-2 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {triggering || isRunning ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isRunning ? 'Running…' : 'Starting…'}
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate Now
                </>
              )}
            </button>
          </div>
        </div>

        {triggerMsg && (
          <div className={`mt-4 text-sm px-4 py-3 rounded-lg border ${
            triggerMsg.type === 'ok'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {triggerMsg.text}
          </div>
        )}

        {/* Config reminder */}
        <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 space-y-0.5">
          <p className="font-semibold">Required in backend <code>.env</code></p>
          <p><code>OPENAI_API_KEY</code> — OpenAI key with gpt-image-2 access</p>
          <p><code>SUPABASE_URL</code> + <code>SUPABASE_SERVICE_ROLE_KEY</code> — Supabase project for image storage</p>
          <p className="mt-1 text-amber-700">
            Create a public bucket named <code>blog-images</code> in your Supabase project → Storage.
          </p>
        </div>
      </div>

      {/* ── Run logs ──────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-900">Run History</h3>
          <button
            onClick={() => { fetchStatus(); fetchLogs(); }}
            className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1.5 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>

        {loadingLogs ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">🤖</p>
            <p className="font-medium">No runs yet</p>
            <p className="text-sm mt-1">Trigger the first generation above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <LogCard key={log._id} log={log} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Stat card ──────────────────────────────────────────────────────────────── */
const StatCard = ({ label, value, sub, accent, loading }) => {
  const accentMap = {
    blue: 'border-l-blue-400',
    emerald: 'border-l-emerald-400',
    gray: 'border-l-gray-300',
  };
  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-5 border-l-4 ${accentMap[accent] || accentMap.gray}`}>
      {loading ? (
        <div className="space-y-2">
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
          <div className="h-6 w-24 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
        </>
      )}
    </div>
  );
};

export default AdminAutoBlog;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

const VISITOR_KEY = 'dl_vid';
const SESSION_KEY = 'dl_sid';
const ATTR_KEY = 'dl_attr';
const SKIP_PREFIXES = ['/admin', '/dashboard'];

const makeId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `dl_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
};

const readStorage = (store, key) => {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (store, key, value) => {
  try {
    store.setItem(key, value);
  } catch {
    /* ignore quota / private mode */
  }
};

const getVisitorId = () => {
  let id = readStorage(localStorage, VISITOR_KEY);
  if (!id) {
    id = makeId();
    writeStorage(localStorage, VISITOR_KEY, id);
  }
  return id;
};

const getSessionId = () => {
  let id = readStorage(sessionStorage, SESSION_KEY);
  if (!id) {
    id = makeId();
    writeStorage(sessionStorage, SESSION_KEY, id);
  }
  return id;
};

const shouldSkip = (pathname) => {
  if (typeof window === 'undefined') return true;
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return true;
  if (readStorage(localStorage, 'dl_track_optout') === '1') return true;
  return SKIP_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};

const getAttribution = (pathname) => {
  const existing = readStorage(sessionStorage, ATTR_KEY);
  if (existing) {
    try {
      return { ...JSON.parse(existing), isLanding: false };
    } catch {
      /* fall through */
    }
  }

  const params = new URLSearchParams(window.location.search);
  let utmSource = params.get('utm_source') || '';
  let utmMedium = params.get('utm_medium') || '';
  if (!utmSource && params.get('gclid')) {
    utmSource = 'google';
    utmMedium = utmMedium || 'cpc';
  }
  if (!utmSource && params.get('fbclid')) {
    utmSource = 'facebook';
    utmMedium = utmMedium || 'paid';
  }

  const attr = {
    referrer: document.referrer || '',
    landingPage: pathname || '/',
    utmSource,
    utmMedium,
    utmCampaign: params.get('utm_campaign') || '',
    utmTerm: params.get('utm_term') || '',
    utmContent: params.get('utm_content') || '',
    isLanding: true,
  };
  writeStorage(sessionStorage, ATTR_KEY, JSON.stringify(attr));
  return attr;
};

let lastSent = { key: '', at: 0 };

export const trackPageView = (pathname) => {
  if (typeof window === 'undefined') return;
  const path = pathname || window.location.pathname || '/';
  if (shouldSkip(path)) return;

  const visitorId = getVisitorId();
  const sessionId = getSessionId();
  const key = `${sessionId}:${path}`;
  const now = Date.now();
  if (lastSent.key === key && now - lastSent.at < 2000) return;
  lastSent = { key, at: now };

  const attr = getAttribution(path);
  const payload = {
    visitorId,
    sessionId,
    path,
    pageTitle: document.title || '',
    siteOrigin: window.location.origin,
    ...attr,
  };

  const url = `${API_BASE_URL}/analytics/pageview`;
  const body = JSON.stringify(payload);
  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => {});
};

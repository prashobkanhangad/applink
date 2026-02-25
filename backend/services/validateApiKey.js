import crypto from 'crypto';
import { ApiKey } from '../models/apiKey.model.js';

/**
 * Middleware: require valid API key for SDK requests.
 * Reads key from header X-Api-Key or Authorization: Bearer <key>.
 * Sets req.apiKeyUserId on success. Returns 401 if missing or invalid.
 */
export const requireApiKey = async (req, res, next) => {
  try {
    const rawKey =
      req.headers['x-api-key'] ||
      (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
        ? req.headers.authorization.slice(7).trim()
        : null);

    if (!rawKey || typeof rawKey !== 'string') {
      return res.status(401).json({ error: 'API key required. Provide X-Api-Key header or Authorization: Bearer <key>.' });
    }

    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const keyDoc = await ApiKey.findOne({ keyHash, status: 'active' }).lean();
    if (!keyDoc) {
      return res.status(401).json({ error: 'Invalid or revoked API key.' });
    }

    req.apiKeyUserId = keyDoc.userId;
    next();
  } catch (err) {
    console.error('[requireApiKey] error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

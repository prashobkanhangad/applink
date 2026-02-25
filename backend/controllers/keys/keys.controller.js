import crypto from 'crypto';
import { ApiKey } from '../../models/apiKey.model.js';
import { sendSuccess, sendError } from '../../services/requestHandler.js';

const PREFIX = 'dl_live_';
const SUFFIX_LENGTH = 5;
const KEY_LENGTH = 32;

function generateRawKey() {
  const random = crypto.randomBytes(KEY_LENGTH).toString('hex');
  return `${PREFIX}${random}`;
}

function hashKey(rawKey) {
  return crypto.createHash('sha256').update(rawKey).digest('hex');
}

/**
 * GET /keys - List API keys for the current user (masked)
 */
export const listKeys = async (req, res) => {
  try {
    const { performingUser } = req;
    const keys = await ApiKey.find({ userId: performingUser._id, status: 'active' })
      .sort({ createdAt: -1 })
      .lean();
    const list = keys.map((k) => ({
      id: k._id,
      _id: k._id,
      name: k.name,
      maskedKey: `${k.keyPrefix}••••••••••••••••••••••••••••••••••${k.keySuffix}`,
      createdAt: k.createdAt,
    }));
    await sendSuccess(req, res, 'API keys fetched successfully', 200, list);
  } catch (error) {
    sendError(req, res, error);
  }
};

/**
 * POST /keys - Create a new API key. Body: { name }. Returns full key once.
 */
export const createKey = async (req, res) => {
  try {
    const { performingUser } = req;
    const { name } = req.body;
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    if (!trimmedName || trimmedName.length < 2) {
      return sendError(req, res, { statusCode: 400, message: 'Key name must be at least 2 characters' });
    }
    const rawKey = generateRawKey();
    const keyHash = hashKey(rawKey);
    const keySuffix = rawKey.slice(-SUFFIX_LENGTH);
    const doc = await ApiKey.create({
      userId: performingUser._id,
      name: trimmedName,
      keyHash,
      keyPrefix: PREFIX,
      keySuffix,
      status: 'active',
    });
    const created = {
      id: doc._id,
      _id: doc._id,
      name: doc.name,
      key: rawKey,
      maskedKey: `${doc.keyPrefix}••••••••••••••••••••••••••••••••••${doc.keySuffix}`,
      createdAt: doc.createdAt,
    };
    await sendSuccess(req, res, 'API key created successfully', 201, created);
  } catch (error) {
    sendError(req, res, error);
  }
};

/**
 * DELETE /keys/:id - Revoke (delete) an API key. Only owner can revoke.
 */
export const revokeKey = async (req, res) => {
  try {
    const { performingUser } = req;
    const { id } = req.params;
    const keyDoc = await ApiKey.findOne({ _id: id, userId: performingUser._id });
    if (!keyDoc) {
      return sendError(req, res, { statusCode: 404, message: 'API key not found' });
    }
    await ApiKey.findByIdAndDelete(id);
    await sendSuccess(req, res, 'API key revoked successfully', 200, {});
  } catch (error) {
    sendError(req, res, error);
  }
};

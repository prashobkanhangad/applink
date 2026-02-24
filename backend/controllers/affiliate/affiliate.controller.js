import { AffiliateSignup } from '../../models/affiliateSignup.model.js';
import { sendSuccess, sendError } from '../../services/requestHandler.js';

/**
 * POST /affiliate/join
 * Public. Body: { name, email, phone, website?, message? }
 */
export const joinAffiliate = async (req, res) => {
  try {
    const { name, email, phone, website = '', message = '' } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ status: 'error', message: 'Name is required' });
    }
    if (!email || !String(email).trim()) {
      return res.status(400).json({ status: 'error', message: 'Email is required' });
    }
    if (!phone || !String(phone).trim()) {
      return res.status(400).json({ status: 'error', message: 'Phone is required' });
    }
    const doc = await AffiliateSignup.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      website: String(website || '').trim(),
      message: String(message || '').trim(),
    });
    await sendSuccess(req, res, 'Thank you! We will get back to you shortly.', 201, {
      id: doc._id,
    });
  } catch (error) {
    console.error('[joinAffiliate]', error);
    sendError(req, res, error);
  }
};

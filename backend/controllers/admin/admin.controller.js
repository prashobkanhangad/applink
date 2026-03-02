import { User } from '../../models/user.model.js';
import { App } from '../../models/app.model.js';
import { Link } from '../../models/links.model.js';
import { PricingPlans } from '../../models/pricingPlans.model.js';
import { AffiliateSignup } from '../../models/affiliateSignup.model.js';
import { SupportMessage } from '../../models/supportMessage.model.js';
import { sendSuccess, sendError } from '../../services/requestHandler.js';
import { emitToUser } from '../../services/socketService.js';

/**
 * GET /admin/stats
 * Returns counts for admin overview: totalUsers, totalApps, totalLinks, totalAffiliates.
 */
export const getStats = async (req, res) => {
  try {
    const [totalUsers, totalApps, totalLinks, totalAffiliates] = await Promise.all([
      User.countDocuments(),
      App.countDocuments(),
      Link.countDocuments(),
      AffiliateSignup.countDocuments(),
    ]);
    await sendSuccess(req, res, 'Admin stats fetched successfully', 200, {
      totalUsers,
      totalApps,
      totalLinks,
      totalAffiliates,
    });
  } catch (error) {
    console.error('[getAdminStats]', error);
    sendError(req, res, error);
  }
};

/**
 * GET /admin/users
 * List all users with pagination. Query: page, limit, search (email/username).
 */
export const getUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const search = (req.query.search || '').trim();
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      filter.$or = [
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('email username role status authProvider createdAt image_url')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    await sendSuccess(req, res, 'Users fetched successfully', 200, {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[getAdminUsers]', error);
    sendError(req, res, error);
  }
};

/**
 * GET /admin/apps
 * List all apps with creator info and link count. Query: page, limit, search (name/subDomain).
 */
export const getApps = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const search = (req.query.search || '').trim();
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subDomain: { $regex: search, $options: 'i' } },
      ];
    }

    const apps = await App.find(filter)
      .populate('createdBy', 'email username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const appIds = apps.map((a) => a._id);
    const linkCounts = await Link.aggregate([
      { $match: { appId: { $in: appIds } } },
      { $group: { _id: '$appId', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(linkCounts.map((c) => [c._id.toString(), c.count]));

    const appsWithCount = apps.map((app) => ({
      ...app,
      linkCount: countMap[app._id.toString()] || 0,
    }));

    const total = await App.countDocuments(filter);

    await sendSuccess(req, res, 'Apps fetched successfully', 200, {
      apps: appsWithCount,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[getAdminApps]', error);
    sendError(req, res, error);
  }
};

/**
 * GET /admin/apps/:id
 * Returns full app details (all fields, createdBy populated, link count).
 */
export const getAppById = async (req, res) => {
  try {
    const { id } = req.params;
    const app = await App.findById(id)
      .populate('createdBy', 'email username image_url')
      .lean();
    if (!app) {
      return res.status(404).json({ status: 'error', message: 'App not found' });
    }
    const linkCount = await Link.countDocuments({ appId: id });
    await sendSuccess(req, res, 'App fetched successfully', 200, {
      app: { ...app, linkCount },
    });
  } catch (error) {
    console.error('[getAppById]', error);
    sendError(req, res, error);
  }
};

/**
 * GET /admin/users/:id
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id)
      .select('email username role status authProvider createdAt updatedAt image_url lastLoginAt')
      .lean();
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }
    const apps = await App.find({ createdBy: id })
      .select('name subDomain fallbackUrl status createdAt')
      .lean();
    const appIds = apps.map((a) => a._id);
    const linkCounts = await Link.aggregate([
      { $match: { appId: { $in: appIds } } },
      { $group: { _id: '$appId', count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(linkCounts.map((c) => [c._id.toString(), c.count]));
    const appsWithCount = apps.map((app) => ({
      ...app,
      linkCount: countMap[app._id.toString()] || 0,
    }));
    await sendSuccess(req, res, 'User fetched successfully', 200, {
      user,
      apps: appsWithCount,
    });
  } catch (error) {
    console.error('[getUserById]', error);
    sendError(req, res, error);
  }
};

/**
 * PATCH /admin/users/:id/role
 * Update a user's role (admin only). Body: { role: 'user' | 'admin' | 'sub_user' }
 */
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const allowedRoles = ['user', 'admin', 'sub_user'];
    if (!role || !allowedRoles.includes(role)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid role. Must be one of: user, admin, sub_user',
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select('email username role');

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    await sendSuccess(req, res, 'User role updated successfully', 200, { user });
  } catch (error) {
    console.error('[updateUserRole]', error);
    sendError(req, res, error);
  }
};

/**
 * GET /admin/plans
 * List all pricing plans (including inactive). Query: page, limit, search (title).
 */
export const getPlans = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const search = (req.query.search || '').trim();
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const [plans, total] = await Promise.all([
      PricingPlans.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      PricingPlans.countDocuments(filter),
    ]);

    await sendSuccess(req, res, 'Plans fetched successfully', 200, {
      plans,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[getAdminPlans]', error);
    sendError(req, res, error);
  }
};

/**
 * GET /admin/plans/:id
 */
export const getPlanById = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await PricingPlans.findById(id).lean();
    if (!plan) {
      return res.status(404).json({ status: 'error', message: 'Plan not found' });
    }
    await sendSuccess(req, res, 'Plan fetched successfully', 200, { plan });
  } catch (error) {
    console.error('[getPlanById]', error);
    sendError(req, res, error);
  }
};

/**
 * POST /admin/plans
 * Body: { title, price, discountedPrice?, benefits?, notIncludedBenefits?, isPopular?, isActive? }
 */
export const createPlan = async (req, res) => {
  try {
    const { title, price, discountedPrice, benefits, notIncludedBenefits, isPopular, isActive } = req.body;
    if (!title || typeof price !== 'number') {
      return res.status(400).json({ status: 'error', message: 'title and price are required' });
    }
    const plan = await PricingPlans.create({
      title: String(title).trim(),
      price: Number(price),
      discountedPrice: discountedPrice != null ? Number(discountedPrice) : 0,
      benefits: Array.isArray(benefits) ? benefits.map((b) => String(b)) : [],
      notIncludedBenefits: Array.isArray(notIncludedBenefits) ? notIncludedBenefits.map((b) => String(b)) : [],
      isPopular: Boolean(isPopular),
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });
    await sendSuccess(req, res, 'Plan created successfully', 201, { plan: plan.toObject ? plan.toObject() : plan });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ status: 'error', message: 'A plan with this title already exists' });
    }
    console.error('[createPlan]', error);
    sendError(req, res, error);
  }
};

/**
 * PATCH /admin/plans/:id
 * Body: { title?, price?, discountedPrice?, benefits?, notIncludedBenefits?, isPopular?, isActive? }
 */
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, discountedPrice, benefits, notIncludedBenefits, isPopular, isActive } = req.body;
    const update = {};
    if (title !== undefined) update.title = String(title).trim();
    if (typeof price === 'number') update.price = price;
    if (discountedPrice !== undefined) update.discountedPrice = Number(discountedPrice);
    if (Array.isArray(benefits)) update.benefits = benefits.map((b) => String(b));
    if (Array.isArray(notIncludedBenefits)) update.notIncludedBenefits = notIncludedBenefits.map((b) => String(b));
    if (isPopular !== undefined) update.isPopular = Boolean(isPopular);
    if (isActive !== undefined) update.isActive = Boolean(isActive);

    const plan = await PricingPlans.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!plan) {
      return res.status(404).json({ status: 'error', message: 'Plan not found' });
    }
    await sendSuccess(req, res, 'Plan updated successfully', 200, { plan });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ status: 'error', message: 'A plan with this title already exists' });
    }
    console.error('[updatePlan]', error);
    sendError(req, res, error);
  }
};

/**
 * DELETE /admin/plans/:id
 */
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await PricingPlans.findByIdAndDelete(id);
    if (!plan) {
      return res.status(404).json({ status: 'error', message: 'Plan not found' });
    }
    await sendSuccess(req, res, 'Plan deleted successfully', 200, {});
  } catch (error) {
    console.error('[deletePlan]', error);
    sendError(req, res, error);
  }
};

/**
 * GET /admin/links
 * List all links with pagination. Query: page, limit, search (linkName/path/destinationUrl), appId (optional).
 */
export const getLinks = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const search = (req.query.search || '').trim();
    const appId = (req.query.appId || '').trim();
    const skip = (page - 1) * limit;

    const filter = {};
    if (appId) filter.appId = appId;
    if (search) {
      filter.$or = [
        { linkName: { $regex: search, $options: 'i' } },
        { path: { $regex: search, $options: 'i' } },
        { destinationUrl: { $regex: search, $options: 'i' } },
      ];
    }

    const [links, total] = await Promise.all([
      Link.find(filter)
        .populate('appId', 'name subDomain')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Link.countDocuments(filter),
    ]);

    await sendSuccess(req, res, 'Links fetched successfully', 200, {
      links,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[getAdminLinks]', error);
    sendError(req, res, error);
  }
};

/**
 * GET /admin/links/:id
 */
export const getLinkById = async (req, res) => {
  try {
    const { id } = req.params;
    const link = await Link.findById(id)
      .populate('appId', 'name subDomain fallbackUrl status')
      .lean();
    if (!link) {
      return res.status(404).json({ status: 'error', message: 'Link not found' });
    }
    await sendSuccess(req, res, 'Link fetched successfully', 200, { link });
  } catch (error) {
    console.error('[getLinkById]', error);
    sendError(req, res, error);
  }
};

/**
 * DELETE /admin/links/:id
 */
export const deleteLink = async (req, res) => {
  try {
    const { id } = req.params;
    const link = await Link.findByIdAndDelete(id);
    if (!link) {
      return res.status(404).json({ status: 'error', message: 'Link not found' });
    }
    await sendSuccess(req, res, 'Link deleted successfully', 200, {});
  } catch (error) {
    console.error('[deleteLink]', error);
    sendError(req, res, error);
  }
};

/**
 * GET /admin/affiliates
 * List affiliate signups with pagination. Query: page, limit, search (name, email, phone).
 */
export const getAffiliates = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const search = (req.query.search || '').trim();
    const skip = (page - 1) * limit;

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [affiliates, total] = await Promise.all([
      AffiliateSignup.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AffiliateSignup.countDocuments(filter),
    ]);

    await sendSuccess(req, res, 'Affiliates fetched successfully', 200, {
      affiliates,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[getAffiliates]', error);
    sendError(req, res, error);
  }
};

/**
 * GET /admin/chat/conversations
 * List users who have at least one support message (conversation list). Each has userId, email, username, lastMessage, lastAt, messageCount.
 */
export const getChatConversations = async (req, res) => {
  try {
    const agg = await SupportMessage.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$userId',
          lastMessage: { $first: '$text' },
          lastAt: { $first: '$createdAt' },
          messageCount: { $sum: 1 },
        },
      },
      { $sort: { lastAt: -1 } },
      { $limit: 200 },
    ]);
    const userIds = agg.map((a) => a._id);
    const users = await User.find({ _id: { $in: userIds } })
      .select('_id email username')
      .lean();
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));
    const conversations = agg.map((a) => ({
      userId: a._id.toString(),
      email: userMap[a._id.toString()]?.email ?? null,
      username: userMap[a._id.toString()]?.username ?? null,
      lastMessage: a.lastMessage,
      lastAt: a.lastAt,
      messageCount: a.messageCount,
    }));
    await sendSuccess(req, res, 'Conversations fetched', 200, { conversations });
  } catch (error) {
    console.error('[getChatConversations]', error);
    sendError(req, res, error);
  }
};

/**
 * GET /admin/chat/conversations/:userId/messages
 * Get all messages for a user (for admin to view thread).
 * When admin opens the thread, user messages are marked delivered+read and user gets message_status (WhatsApp-style ticks).
 */
export const getChatMessagesForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 200);
    const messages = await SupportMessage.find({ userId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();
    const io = req.app.get('io');
    const now = new Date();
    for (const m of messages) {
      if (!m.fromSupport && (!m.deliveredAt || !m.readAt)) {
        const deliveredAt = m.deliveredAt || now;
        const readAt = now;
        await SupportMessage.findByIdAndUpdate(m._id, { deliveredAt, readAt });
        if (io) {
          emitToUser(io, userId, 'message_status', {
            messageId: m._id.toString(),
            status: 'read',
            deliveredAt,
            readAt,
          });
        }
      }
    }
    const list = messages.map((m) => {
      const isUserMsg = !m.fromSupport;
      const deliveredAt = isUserMsg && (!m.deliveredAt || !m.readAt) ? now : (m.deliveredAt ?? null);
      const readAt = isUserMsg && (!m.deliveredAt || !m.readAt) ? now : (m.readAt ?? null);
      return {
        id: m._id.toString(),
        from: m.fromSupport ? 'support' : 'user',
        text: m.text,
        time: m.createdAt,
        deliveredAt,
        readAt,
      };
    });
    await sendSuccess(req, res, 'Messages fetched', 200, { messages: list });
  } catch (error) {
    console.error('[getChatMessagesForUser]', error);
    sendError(req, res, error);
  }
};

/**
 * POST /admin/chat/conversations/:userId/messages
 * Body: { text: string }
 * Send a reply as support to the user.
 */
export const sendChatReply = async (req, res) => {
  try {
    const { userId } = req.params;
    const text = typeof req.body?.text === 'string' ? req.body.text.trim() : '';
    if (!text) {
      return res.status(400).json({ status: 'error', message: 'Message text is required' });
    }
    const doc = await SupportMessage.create({
      userId,
      text,
      fromSupport: true,
    });
    const msg = {
      id: doc._id.toString(),
      from: 'support',
      text: doc.text,
      time: doc.createdAt,
      deliveredAt: doc.deliveredAt ?? null,
      readAt: doc.readAt ?? null,
    };
    const io = req.app.get('io');
    if (io) emitToUser(io, userId, 'new_message', { message: msg });
    await sendSuccess(req, res, 'Reply sent', 201, { message: msg });
  } catch (error) {
    console.error('[sendChatReply]', error);
    sendError(req, res, error);
  }
};

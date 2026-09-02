import { PageView } from "../../models/pageView.model.js";
import { sendSuccess, sendError } from "../../services/requestHandler.js";

const parseRange = (query) => {
  const end = query.endDate ? new Date(`${query.endDate}T23:59:59.999Z`) : new Date();
  const start = query.startDate
    ? new Date(`${query.startDate}T00:00:00.000Z`)
    : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    const fallbackEnd = new Date();
    return {
      start: new Date(fallbackEnd.getTime() - 7 * 24 * 60 * 60 * 1000),
      end: fallbackEnd,
    };
  }
  return { start, end };
};

const toDateKey = (date) => date.toISOString().slice(0, 10);

const fillDaily = (rows, start, end) => {
  const map = Object.fromEntries(rows.map((row) => [row.date, row]));
  const days = [];
  const cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  while (cursor <= last) {
    const date = toDateKey(cursor);
    days.push(map[date] || { date, views: 0, visitors: 0 });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return days;
};

/**
 * GET /admin/analytics/visitors?startDate&endDate
 * Site visitor tracking: counts, sources, pages, referrers, geography, devices.
 */
export const getVisitorAnalytics = async (req, res) => {
  try {
    const { start, end } = parseRange(req.query);
    const match = { createdAt: { $gte: start, $lte: end } };

    const [
      totalsAgg,
      pages,
      sources,
      sourceTypes,
      referrers,
      dailyAgg,
      countries,
      devices,
    ] = await Promise.all([
      PageView.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            pageViews: { $sum: 1 },
            visitors: { $addToSet: "$visitorId" },
            sessions: { $addToSet: "$sessionId" },
          },
        },
        {
          $project: {
            _id: 0,
            pageViews: 1,
            uniqueVisitors: { $size: "$visitors" },
            sessions: { $size: "$sessions" },
          },
        },
      ]),
      PageView.aggregate([
        { $match: match },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$path",
            views: { $sum: 1 },
            visitors: { $addToSet: "$visitorId" },
            title: { $first: "$pageTitle" },
          },
        },
        {
          $project: {
            path: "$_id",
            views: 1,
            visitors: { $size: "$visitors" },
            title: 1,
            _id: 0,
          },
        },
        { $sort: { views: -1 } },
        { $limit: 50 },
      ]),
      PageView.aggregate([
        { $match: { ...match, isLanding: true } },
        {
          $group: {
            _id: "$source",
            views: { $sum: 1 },
            visitors: { $addToSet: "$visitorId" },
            sourceType: { $first: "$sourceType" },
          },
        },
        {
          $project: {
            source: "$_id",
            views: 1,
            visitors: { $size: "$visitors" },
            sourceType: 1,
            _id: 0,
          },
        },
        { $sort: { visitors: -1 } },
        { $limit: 30 },
      ]),
      PageView.aggregate([
        { $match: { ...match, isLanding: true } },
        {
          $group: {
            _id: "$sourceType",
            views: { $sum: 1 },
            visitors: { $addToSet: "$visitorId" },
          },
        },
        {
          $project: {
            sourceType: "$_id",
            views: 1,
            visitors: { $size: "$visitors" },
            _id: 0,
          },
        },
        { $sort: { visitors: -1 } },
      ]),
      PageView.aggregate([
        {
          $match: {
            ...match,
            isLanding: true,
            referrerHost: { $nin: ["", null] },
            sourceType: { $ne: "internal" },
          },
        },
        {
          $group: {
            _id: "$referrerHost",
            views: { $sum: 1 },
            visitors: { $addToSet: "$visitorId" },
          },
        },
        {
          $project: {
            host: "$_id",
            views: 1,
            visitors: { $size: "$visitors" },
            _id: 0,
          },
        },
        { $sort: { visitors: -1 } },
        { $limit: 30 },
      ]),
      PageView.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            views: { $sum: 1 },
            visitors: { $addToSet: "$visitorId" },
          },
        },
        {
          $project: {
            date: "$_id",
            views: 1,
            visitors: { $size: "$visitors" },
            _id: 0,
          },
        },
        { $sort: { date: 1 } },
      ]),
      PageView.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$country",
            views: { $sum: 1 },
            visitors: { $addToSet: "$visitorId" },
          },
        },
        {
          $project: {
            name: "$_id",
            count: { $size: "$visitors" },
            views: 1,
            _id: 0,
          },
        },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]),
      PageView.aggregate([
        { $match: match },
        {
          $group: {
            _id: "$deviceType",
            views: { $sum: 1 },
            visitors: { $addToSet: "$visitorId" },
          },
        },
        {
          $project: {
            name: "$_id",
            count: { $size: "$visitors" },
            views: 1,
            _id: 0,
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

    const totals = totalsAgg[0] || { pageViews: 0, uniqueVisitors: 0, sessions: 0 };
    const visitorIds = await PageView.distinct("visitorId", match);
    let returningVisitors = 0;
    if (visitorIds.length > 0) {
      const returning = await PageView.distinct("visitorId", {
        visitorId: { $in: visitorIds },
        createdAt: { $lt: start },
      });
      returningVisitors = returning.length;
    }
    const newVisitors = Math.max(0, totals.uniqueVisitors - returningVisitors);

    await sendSuccess(req, res, "Visitor analytics fetched successfully", 200, {
      startDate: toDateKey(start),
      endDate: toDateKey(end),
      totals: {
        ...totals,
        newVisitors,
        returningVisitors,
      },
      pages,
      sources,
      sourceTypes,
      referrers,
      daily: fillDaily(dailyAgg, start, end),
      countries,
      devices,
    });
  } catch (error) {
    console.error("[getVisitorAnalytics]", error);
    sendError(req, res, error);
  }
};

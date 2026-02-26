import { ClickEvent } from "../models/clickEvent.model.js";
import { InstallEvent } from "../models/installEvent.model.js";
import { Link } from "../models/links.model.js";

/**
 * Get last SDK activity timestamp per app and platform from events (single source of truth).
 * Uses linkId to attribute events to apps: Link has appId, events have linkId.
 * ClickEvent always has linkId; InstallEvent may have linkId (only those count for install activity per app).
 * @param {import('mongoose').Types.ObjectId[]} appIds
 * @returns {Promise<Record<string, { android: Date|null, ios: Date|null }>>} Map of appId string -> { android, ios }
 */
export async function getLastSdkActivityByAppPlatform(appIds) {
    if (!appIds?.length) return {};

    const ids = [...new Set(appIds.map((id) => id.toString()))];
    const result = {};
    ids.forEach((id) => {
        result[id] = { android: null, ios: null };
    });

    const links = await Link.find({ appId: { $in: appIds } }).select("_id appId").lean();
    const linkIds = links.map((l) => l._id);
    const linkIdToAppId = {};
    links.forEach((l) => {
        linkIdToAppId[l._id.toString()] = l.appId?.toString();
    });

    if (linkIds.length === 0) return result;

    const [clicks, installs] = await Promise.all([
        ClickEvent.aggregate([
            { $match: { linkId: { $in: linkIds }, platform: { $in: ["android", "ios"] } } },
            { $group: { _id: { linkId: "$linkId", platform: "$platform" }, lastAt: { $max: "$createdAt" } } },
        ]),
        InstallEvent.aggregate([
            { $match: { linkId: { $in: linkIds }, platform: { $in: ["android", "ios"] } } },
            { $group: { _id: { linkId: "$linkId", platform: "$platform" }, lastAt: { $max: "$createdAt" } } },
        ]),
    ]);

    const merge = (items) => {
        items.forEach(({ _id, lastAt }) => {
            const appIdStr = linkIdToAppId[_id.linkId?.toString()];
            if (!appIdStr || !result[appIdStr]) return;
            if (_id.platform === "android" && (!result[appIdStr].android || lastAt > result[appIdStr].android)) {
                result[appIdStr].android = lastAt;
            }
            if (_id.platform === "ios" && (!result[appIdStr].ios || lastAt > result[appIdStr].ios)) {
                result[appIdStr].ios = lastAt;
            }
        });
    };
    merge(clicks);
    merge(installs);

    return result;
}

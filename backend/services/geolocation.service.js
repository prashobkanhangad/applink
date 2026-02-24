import axios from "axios";

const unknown = "unknown";

/**
 * Resolve country, state (region), and city from an IP address.
 * Uses ipwhois.app free API (no key required). Falls back to "unknown" on failure.
 * @param {string} ip - Client IP (e.g. from req.ip or x-forwarded-for)
 * @returns {Promise<{ country: string, state: string, city: string }>}
 */
export async function getGeoFromIp(ip) {
    const fallback = { country: unknown, state: unknown, city: unknown };
    if (!ip || ip === "unknown" || ip === "::1" || ip === "127.0.0.1") {
        return fallback;
    }
    try {
        const response = await axios.get(`https://ipwhois.app/json/${ip}`, {
            timeout: 5000,
            validateStatus: (status) => status === 200,
        });
        const data = response.data;
        if (!data || data.success === false) return fallback;
        return {
            country: data.country ?? unknown,
            state: data.region ?? data.state ?? unknown,
            city: data.city ?? unknown,
        };
    } catch (_) {
        return fallback;
    }
}

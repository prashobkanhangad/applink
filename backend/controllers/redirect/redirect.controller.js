import { Link } from "../../models/links.model.js";
import { App } from "../../models/app.model.js";
import { PendingInstall } from "../../models/pendingInstall.model.js";
import { ClickEvent } from "../../models/clickEvent.model.js";
import useragent from "express-useragent";

/**
 * Handle redirect requests for deep links
 * GET /:slug
 * 
 * This is a public endpoint (no JWT required) that handles:
 * 1. Identifying the tenant by hostname
 * 2. Finding the link by slug and domain
 * 3. Device detection and smart routing
 * 4. Deferred deep linking (PendingInstall)
 * 5. Analytics logging
 */
export const handleRedirect = async (req, res) => {
    try {
        // Skip if this is an API route (safety check)
        if (req.path.startsWith('/api')) {
            return res.status(404).send("Not found");
        }

        const slug = req.params.slug; // e.g., "sale"
        const hostname = req.hostname; // e.g., "nike.lorrymithra.in" or "earlyjobs.chottu.link"
        
        // 1. Identify the Context (Who is the tenant?)
        let app = null;
        const isMainDomain = hostname === process.env.MAIN_DOMAIN;

        if (!isMainDomain) {
            // It's a custom domain or subdomain - find the App
            app = await App.findOne({ subDomain: hostname });
            if (!app) {
                return res.status(404).send("Domain not configured");
            }
        } else {
            // For main domain, we might need a different approach
            // For now, we'll try to find by hostname as subDomain
            app = await App.findOne({ subDomain: hostname });
            if (!app) {
                return res.status(404).send("App not found for this domain");
            }
        }

        // 2. Find the Link by appId and path (slug)
        // Try both with and without leading slash
        const slugWithSlash = slug.startsWith('/') ? slug : `/${slug}`;
        const slugWithoutSlash = slug.startsWith('/') ? slug.slice(1) : slug;
        
        const link = await Link.findOne({ 
            appId: app._id,
            $or: [
                { path: slugWithSlash },
                { path: slugWithoutSlash }
            ]
        });

        if (!link) {
            return res.status(404).send("Link not found");
        }

        // 3. Detect User Device (The "Smart" Part)
        const source = req.headers['user-agent'] || '';
        const ua = useragent.parse(source);
        
        // 4. The Logic Tree - Determine destination URL
        // Default fallback: use app's fallbackUrl if available, otherwise use link's destinationUrl
        let destination = app.fallbackUrl || link.destinationUrl;

        // Determine platform for analytics
        let platform = "web";
        if (ua.isiPhone || ua.isiPad) {
            platform = "ios";
        } else if (ua.isAndroid) {
            platform = "android";
        }

        // Logic: If on Mobile -> Try Deep Link
        if (ua.isMobile) {
            // A. SAVE FINGERPRINT (Deferred Deep Linking)
            // We save this "intent" before sending them to the Store
            const fingerprintHash = `${req.ip || 'unknown'}-${ua.os || 'unknown'}-${ua.platform || 'unknown'}`;
            
            try {
                await PendingInstall.create({
                    fingerprintHash: fingerprintHash,
                    ip: req.ip || 'unknown',
                    userAgent: source,
                    linkData: {
                        destinationUrl: link.destinationUrl,
                        utm: link.utm || {}
                    },
                    linkId: link._id
                });
            } catch (pendingInstallError) {
                // Log but don't fail the redirect
                console.error("Error creating PendingInstall:", pendingInstallError);
            }

            // B. Routing based on behavior and platform
            if (ua.isiPhone || ua.isiPad) {
                // iOS routing
                if (link.iosBehavior === "open_app" && app.configurations?.ios) {
                    const storeId = app.configurations.ios.storeId;
                    if (storeId) {
                        // Redirect to App Store if storeId is available
                        destination = `https://apps.apple.com/app/id${storeId}`;
                    } else {
                        // Try Universal Link - construct from destination URL
                        // Universal Links should be configured on the app side
                        destination = link.destinationUrl;
                    }
                } else {
                    // Fallback to destination URL
                    destination = link.destinationUrl;
                }
            } else if (ua.isAndroid) {
                // Android routing
                if (link.androidBehavior === "open_app" && app.configurations?.android) {
                    const packageName = app.configurations.android.packageName;
                    if (packageName) {
                        try {
                            // Build Android Intent URL for deep linking
                            // Format: intent://[host]/[path]#Intent;scheme=[scheme];package=[package];end
                            const urlParts = new URL(link.destinationUrl);
                            destination = `intent://${urlParts.host}${urlParts.pathname}${urlParts.search}#Intent;scheme=https;package=${packageName};end`;
                        } catch (urlError) {
                            // If URL parsing fails, fallback to destination URL
                            console.error("Error parsing destination URL for Android Intent:", urlError);
                            destination = link.destinationUrl;
                        }
                    } else {
                        // Fallback to destination URL
                        destination = link.destinationUrl;
                    }
                } else {
                    // Fallback to destination URL
                    destination = link.destinationUrl;
                }
            }
        }

        // 5. Analytics (Fire and forget to keep redirect fast)
        logClick(link._id, req, ua, platform).catch(err => {
            console.error("Error logging click:", err);
        });

        // 6. EXECUTE REDIRECT
        return res.redirect(301, destination);

    } catch (err) {
        console.error("Redirect Error:", err);
        res.status(500).send("Internal Server Error");
    }
};

/**
 * Helper for analytics - logs click events
 * Fire and forget (don't await) to keep redirect fast
 */
const logClick = async (linkId, req, ua, platform) => {
    try {
        // Get IP address (handle proxies)
        const ip = req.ip || 
                   req.headers['x-forwarded-for']?.split(',')[0] || 
                   req.connection?.remoteAddress || 
                   'unknown';

        // Extract browser name
        const browser = ua?.browser || ua?.source || 'unknown';

        // For now, use default geolocation values
        // In production, you might want to use a geolocation service
        const country = 'unknown';
        const state = 'unknown';
        const city = 'unknown';

        await ClickEvent.create({
            linkId: linkId,
            platform: platform,
            browser: browser,
            userAgent: req.headers['user-agent'] || 'unknown',
            ipAddress: ip,
            country: country,
            state: state,
            city: city
        });
    } catch (error) {
        console.error("Error in logClick:", error);
        // Don't throw - this is fire and forget
    }
};

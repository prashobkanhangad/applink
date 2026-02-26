import cron from 'node-cron';
import { DomainVerification } from '../models/domainVerification.model.js';
import { App } from '../models/app.model.js';
import { verifyDomain } from './domainVerification.service.js';
import { getLastSdkActivityByAppPlatform } from './sdkActivity.service.js';

const SDK_STALE_DAYS = 10;
const SDK_STALE_MS = SDK_STALE_DAYS * 24 * 60 * 60 * 1000;

/**
 * Domain Verification Cron Job
 * Checks pending domains and updates their verification status
 */

/**
 * Check and update verification status for all pending domains
 */
export const checkPendingDomains = async () => {
    console.log('[Cron] Starting domain verification check...');
    
    try {
        // Find all pending domains that are not deleted
        const pendingDomains = await DomainVerification.find({
            status: { $in: ['pending', 'failed'] },
            isDeleted: { $ne: true }
        });

        console.log(`[Cron] Found ${pendingDomains.length} domains to check`);

        if (pendingDomains.length === 0) {
            console.log('[Cron] No pending domains to verify');
            return { checked: 0, verified: 0, failed: 0 };
        }

        let verified = 0;
        let failed = 0;

        for (const domain of pendingDomains) {
            try {
                console.log(`[Cron] Checking domain: ${domain.subdomain}.${domain.domain}`);
                
                const isVerified = await verifyDomain(
                    domain.subdomain,
                    domain.domain,
                    domain.cnameTarget
                );

                if (isVerified) {
                    domain.status = 'verified';
                    domain.verifiedAt = new Date();
                    domain.lastVerifiedAt = new Date();
                    verified++;
                    console.log(`[Cron] ✓ Domain verified: ${domain.subdomain}.${domain.domain}`);
                } else {
                    domain.status = 'failed';
                    domain.lastVerifiedAt = new Date();
                    failed++;
                    console.log(`[Cron] ✗ Domain verification failed: ${domain.subdomain}.${domain.domain}`);
                }

                await domain.save();

            } catch (error) {
                console.error(`[Cron] Error checking domain ${domain.subdomain}.${domain.domain}:`, error.message);
                failed++;
            }

            // Small delay between checks to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`[Cron] Domain verification complete. Checked: ${pendingDomains.length}, Verified: ${verified}, Failed: ${failed}`);
        
        return { checked: pendingDomains.length, verified, failed };

    } catch (error) {
        console.error('[Cron] Error in domain verification cron:', error);
        throw error;
    }
};

/**
 * Clear SDK verification for apps with no SDK activity in the last 10 days (connection issue).
 * Uses last activity from ClickEvent + InstallEvent (single source of truth), not stored on App.
 */
export const clearStaleSdkVerification = async () => {
    console.log('[Cron] Starting stale SDK verification clear...');
    const cutoff = new Date(Date.now() - SDK_STALE_MS);
    try {
        const appsWithVerified = await App.find({
            $or: [
                { 'configurations.android.sdkVerifiedAt': { $ne: null } },
                { 'configurations.ios.sdkVerifiedAt': { $ne: null } },
            ],
        })
            .select('_id configurations.android.sdkVerifiedAt configurations.ios.sdkVerifiedAt')
            .lean();

        const appIds = appsWithVerified.map((a) => a._id);
        const lastActivity = await getLastSdkActivityByAppPlatform(appIds);

        let cleared = 0;
        for (const app of appsWithVerified) {
            const id = app._id.toString();
            const updates = {};
            // Only clear when we have event-based activity that is stale (ignore null = no events with appId yet, e.g. legacy)
            const androidStale = app.configurations?.android?.sdkVerifiedAt && lastActivity[id]?.android != null && new Date(lastActivity[id].android) < cutoff;
            const iosStale = app.configurations?.ios?.sdkVerifiedAt && lastActivity[id]?.ios != null && new Date(lastActivity[id].ios) < cutoff;
            if (androidStale) updates['configurations.android.sdkVerifiedAt'] = null;
            if (iosStale) updates['configurations.ios.sdkVerifiedAt'] = null;
            if (Object.keys(updates).length) {
                await App.updateOne({ _id: app._id }, { $set: updates });
                cleared += Object.keys(updates).length;
            }
        }
        if (cleared > 0) {
            console.log(`[Cron] Cleared SDK verification for ${cleared} stale app/platform(s). Cutoff: ${cutoff.toISOString()}`);
        }
        return { cleared };
    } catch (error) {
        console.error('[Cron] Error clearing stale SDK verification:', error);
        throw error;
    }
};

/**
 * Initialize all cron jobs
 */
export const initCronJobs = () => {
    console.log('[Cron] Initializing cron jobs...');

    // Check pending domains every 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        console.log('[Cron] Running pending domain verification job...');
        try {
            await checkPendingDomains();
        } catch (error) {
            console.error('[Cron] Pending domain check failed:', error);
        }
    });

    // Daily: clear SDK verification when no SDK activity for 10 days (connection issue)
    cron.schedule('0 2 * * *', async () => {
        console.log('[Cron] Running stale SDK verification clear...');
        try {
            await clearStaleSdkVerification();
        } catch (error) {
            console.error('[Cron] Stale SDK verification clear failed:', error);
        }
    });

    // Optional: Re-verify existing domains every 6 hours
    // Uncomment if you want to detect when users remove their CNAME records
    // cron.schedule('0 */6 * * *', async () => {
    //     console.log('[Cron] Running domain re-verification job...');
    //     try {
    //         await reVerifyDomains();
    //     } catch (error) {
    //         console.error('[Cron] Domain re-verification failed:', error);
    //     }
    // });

    console.log('[Cron] Cron jobs initialized:');
    console.log('  - Pending domain check: Every 5 minutes');
    console.log(`  - Stale SDK verification clear: Daily at 02:00 (no activity for ${SDK_STALE_DAYS} days)`);

    // Run initial check after 30 seconds of startup
    setTimeout(async () => {
        console.log('[Cron] Running initial domain verification check...');
        try {
            await checkPendingDomains();
        } catch (error) {
            console.error('[Cron] Initial check failed:', error);
        }
    }, 30000);
};

export default { initCronJobs, checkPendingDomains };

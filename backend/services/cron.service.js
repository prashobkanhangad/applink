import cron from 'node-cron';
import { DomainVerification } from '../models/domainVerification.model.js';
import { verifyDomain } from './domainVerification.service.js';

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

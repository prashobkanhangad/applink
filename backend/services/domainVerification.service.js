import dns from 'dns/promises';

// The target CNAME that all subdomains should point to
const CNAME_TARGET = process.env.CNAME_TARGET || 'target.lorrymithra.in';

/**
 * Check if a CNAME record exists for domain verification
 * @param {string} subdomain - The subdomain to check (e.g., "link")
 * @param {string} domain - The main domain (e.g., "invyto.in")
 * @param {string} expectedTarget - The expected CNAME target (e.g., "target.lorrymithra.in")
 * @returns {Promise<boolean>} - True if CNAME record points to the expected target
 */
export const verifyCNAMERecord = async (subdomain, domain, expectedTarget = CNAME_TARGET) => {
    try {
        const fullDomain = `${subdomain}.${domain}`;
        console.log(`[Domain Verification] Starting CNAME record verification for: ${fullDomain}`);
        console.log(`[Domain Verification] Expected CNAME target: ${expectedTarget}`);
        
        const cnameRecords = await dns.resolveCname(fullDomain);
        console.log(`[Domain Verification] Found CNAME record(s) for ${fullDomain}:`, cnameRecords);
        
        // Check if any CNAME record matches the expected target
        // Normalize by removing trailing dots and comparing lowercase
        const normalizedTarget = expectedTarget.toLowerCase().replace(/\.$/, '');
        const isVerified = cnameRecords.some(record => {
            const normalizedRecord = record.toLowerCase().replace(/\.$/, '');
            return normalizedRecord === normalizedTarget;
        });
        
        if (isVerified) {
            console.log(`[Domain Verification] ✓ CNAME verification successful for ${fullDomain}`);
        } else {
            console.log(`[Domain Verification] ✗ CNAME verification failed for ${fullDomain} - expected ${expectedTarget}, found:`, cnameRecords);
        }
        
        return isVerified;
    } catch (error) {
        console.error(`[Domain Verification] Error checking CNAME record for ${subdomain}.${domain}:`, error.message);
        if (error.code === 'ENODATA' || error.code === 'ENOTFOUND') {
            console.log(`[Domain Verification] No CNAME record found for ${subdomain}.${domain}`);
        }
        return false;
    }
};

/**
 * Verify domain ownership using CNAME method
 * @param {string} subdomain - The subdomain (e.g., "link")
 * @param {string} domain - The main domain (e.g., "invyto.in")
 * @param {string} cnameTarget - The expected CNAME target
 * @returns {Promise<boolean>} - True if domain is verified
 */
export const verifyDomain = async (subdomain, domain, cnameTarget = CNAME_TARGET) => {
    try {
        return await verifyCNAMERecord(subdomain, domain, cnameTarget);
    } catch (error) {
        console.error('Error verifying domain:', error);
        return false;
    }
};

/**
 * Validate domain format
 * @param {string} domain - The domain to validate
 * @returns {boolean} - True if domain format is valid
 */
export const isValidDomain = (domain) => {
    // Basic domain validation regex
    const domainPattern = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    return domainPattern.test(domain);
};

/**
 * Validate subdomain format
 * @param {string} subdomain - The subdomain to validate
 * @returns {boolean} - True if subdomain format is valid
 */
export const isValidSubdomain = (subdomain) => {
    // Subdomain validation: alphanumeric, hyphens allowed (not at start/end), 1-63 chars
    const subdomainPattern = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i;
    return subdomainPattern.test(subdomain);
};

/**
 * Get the CNAME target
 * @returns {string} - The CNAME target domain
 */
export const getCNAMETarget = () => {
    return CNAME_TARGET;
};

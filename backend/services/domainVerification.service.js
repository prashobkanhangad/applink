import dns from 'dns/promises';
import https from 'https';
import http from 'http';

/**
 * Check if a TXT record exists for domain verification
 * @param {string} domain - The domain to check
 * @param {string} verificationToken - The verification token to look for
 * @returns {Promise<boolean>} - True if verification token found in TXT records
 */
export const verifyTXTRecord = async (domain, verificationToken) => {
    try {
        console.log(`[Domain Verification] Starting TXT record verification for domain: ${domain}`);
        console.log(`[Domain Verification] Looking for verification token: ${verificationToken}`);
        
        const txtRecords = await dns.resolveTxt(domain);
        console.log(`[Domain Verification] Found ${txtRecords.length} TXT record(s) for ${domain}`);
        
        // Flatten the array of arrays (TXT records can be arrays of strings)
        const allRecords = txtRecords.flat();
        console.log(`[Domain Verification] Flattened to ${allRecords.length} record(s):`, allRecords);
        
        // Check if any record contains the verification token
        const verificationString = `chottu-verify=${verificationToken}`;
        console.log(`[Domain Verification] Checking for verification string: ${verificationString}`);
        
        const isVerified = allRecords.some(record => record.includes(verificationString));
        
        if (isVerified) {
            console.log(`[Domain Verification] ✓ Verification successful for ${domain}`);
        } else {
            console.log(`[Domain Verification] ✗ Verification failed for ${domain} - verification string not found in TXT records`);
        }
        
        return isVerified;
    } catch (error) {
        console.error(`[Domain Verification] Error checking TXT record for ${domain}:`, error.message);
        console.error(`[Domain Verification] Error details:`, error);
        return false;
    }
};

/**
 * Check if an HTML file exists at the verification path
 * @param {string} domain - The domain to check
 * @param {string} verificationToken - The verification token
 * @returns {Promise<boolean>} - True if verification file exists and contains token
 */
export const verifyHTMLFile = async (domain, verificationToken) => {
    return new Promise((resolve) => {
        const verificationPath = `/.well-known/chottu-verify-${verificationToken}.html`;
        const url = `https://${domain}${verificationPath}`;
        
        const request = https.get(url, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                // Check if the file contains the verification token
                const containsToken = data.includes(verificationToken);
                resolve(res.statusCode === 200 && containsToken);
            });
        });
        
        request.on('error', (error) => {
            console.error('Error checking HTML file:', error);
            resolve(false);
        });
        
        request.setTimeout(5000, () => {
            request.destroy();
            resolve(false);
        });
    });
};

/**
 * Verify domain ownership using the specified method
 * @param {string} domain - The domain to verify
 * @param {string} verificationToken - The verification token
 * @param {string} method - Verification method ('txt' or 'html')
 * @returns {Promise<boolean>} - True if domain is verified
 */
export const verifyDomain = async (domain, verificationToken, method = 'txt') => {
    try {
        if (method === 'txt') {
            return await verifyTXTRecord(domain, verificationToken);
        } else if (method === 'html') {
            return await verifyHTMLFile(domain, verificationToken);
        }
        return false;
    } catch (error) {
        console.error('Error verifying domain:', error);
        return false;
    }
};

/**
 * Generate a unique verification token
 * @returns {string} - A unique verification token
 */
export const generateVerificationToken = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
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

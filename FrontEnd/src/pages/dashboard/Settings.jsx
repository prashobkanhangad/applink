import React, { useState, useEffect } from 'react';
import { Globe, X, CheckCircle2, Loader2, AlertCircle, Info } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { addDomain, verifyDomain, getDomains, deleteDomain } from '../../services/domainService';

/**
 * Settings Page - Manage application settings
 */
export const Settings = () => {
  const [customDomain, setCustomDomain] = useState('');
  const [subdomain, setSubdomain] = useState('link');
  const [isAddingDomain, setIsAddingDomain] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [domains, setDomains] = useState([]); // Array of domain verification objects from API
  const [verifyingDomain, setVerifyingDomain] = useState(null);
  const [verificationError, setVerificationError] = useState(null);

  // Load domains on component mount
  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      setIsLoading(true);
      const result = await getDomains();
      if (result.success && result.domains) {
        setDomains(result.domains);
      }
    } catch (error) {
      console.error('Failed to load domains:', error);
      setError(error.message || 'Failed to load domains');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDomain = async () => {
    if (!customDomain.trim()) {
      setError('Please enter a domain name');
      return;
    }

    if (!subdomain.trim()) {
      setError('Please enter a subdomain');
      return;
    }

    // Basic domain validation
    const domainPattern = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    if (!domainPattern.test(customDomain.trim())) {
      setError('Please enter a valid domain name (e.g., example.com)');
      return;
    }

    // Subdomain validation
    const subdomainPattern = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i;
    if (!subdomainPattern.test(subdomain.trim())) {
      setError('Please enter a valid subdomain (letters, numbers, hyphens only)');
      return;
    }

    // Check if domain + subdomain already exists
    const domainLower = customDomain.trim().toLowerCase();
    const subdomainLower = subdomain.trim().toLowerCase();
    if (domains.some(d => d.domain.toLowerCase() === domainLower && d.subdomain?.toLowerCase() === subdomainLower)) {
      setError('This domain and subdomain combination has already been added');
      return;
    }

    setIsAddingDomain(true);
    setError(null);
    setSuccessMessage(null);
    setVerificationError(null);

    try {
      const result = await addDomain({
        domain: customDomain.trim(),
        subdomain: subdomain.trim()
      });

      if (result.success) {
        // Reload domains to get the new one with all data
        await loadDomains();
        setSuccessMessage(result.message || `Domain "${subdomain.trim()}.${customDomain.trim()}" added successfully! Please configure CNAME record and verify.`);
        setCustomDomain('');
        setSubdomain('link');
      }
    } catch (error) {
      console.error('Failed to add domain:', error);
      setError(error.message || 'Failed to add domain. Please try again.');
    } finally {
      setIsAddingDomain(false);
    }
  };

  const handleVerifyDomain = async (domainId) => {
    setVerifyingDomain(domainId);
    setVerificationError(null);
    setError(null);

    try {
      const result = await verifyDomain(domainId);

      if (result.success) {
        // Reload domains to get updated status
        await loadDomains();
        
        const updatedDomain = result.domain;
        if (updatedDomain.status === 'verified') {
          setSuccessMessage(`Domain "${updatedDomain.subdomain}.${updatedDomain.domain}" has been verified successfully!`);
        } else {
          setVerificationError(`CNAME verification failed for ${updatedDomain.subdomain}.${updatedDomain.domain}. Please ensure the CNAME record is configured correctly and try again.`);
        }
      }
    } catch (error) {
      console.error('Failed to verify domain:', error);
      setVerificationError(error.message || 'Failed to verify domain. Please try again.');
    } finally {
      setVerifyingDomain(null);
    }
  };

  const handleRemoveDomain = async (domainId, domainName) => {
    if (!window.confirm(`Are you sure you want to remove "${domainName}"?`)) {
      return;
    }

    try {
      const result = await deleteDomain(domainId);
      if (result.success) {
        // Reload domains after deletion
        await loadDomains();
        setSuccessMessage(`Domain "${domainName}" removed successfully`);
    setError(null);
    setVerificationError(null);
      }
    } catch (error) {
      console.error('Failed to remove domain:', error);
      setError(error.message || 'Failed to remove domain. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Verified
          </span>
        );
      case 'verifying':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            <Loader2 className="animate-spin w-3 h-3 mr-1" />
            Verifying...
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20">
            <AlertCircle className="w-3 h-3 mr-1" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
            Pending Verification
          </span>
        );
    }
  };

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account settings">
      <main className="flex-1 overflow-y-auto bg-transparent">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Custom Domain Section */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Custom Domain</h2>
                <p className="text-sm text-gray-500">
                  Add your own custom domain to use with your links instead of the default chottu.link domain.
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0 border border-primary/20">
                <Globe className="w-6 h-6 text-primary" />
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-xl flex items-start justify-between">
                <p className="text-sm text-gray-900">{successMessage}</p>
                <button onClick={() => setSuccessMessage(null)} className="text-gray-500 hover:text-gray-900 ml-4 p-1 rounded" aria-label="Dismiss">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start justify-between">
                <p className="text-sm text-destructive">{error}</p>
                <button onClick={() => setError(null)} className="text-destructive/80 hover:text-destructive ml-4 p-1 rounded" aria-label="Dismiss">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Verification Error Message */}
            {verificationError && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start justify-between">
                <p className="text-sm text-destructive">{verificationError}</p>
                <button onClick={() => setVerificationError(null)} className="text-destructive/80 hover:text-destructive ml-4 p-1 rounded" aria-label="Dismiss">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Domain Input Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Domain Name</label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => { setCustomDomain(e.target.value); setError(null); setSuccessMessage(null); }}
                    placeholder="example.com"
                    className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">Enter your domain name without http:// or https:// (e.g., example.com)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Subdomain</label>
                <div className="flex flex-wrap gap-3 items-center">
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => { setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')); setError(null); setSuccessMessage(null); }}
                    placeholder="link"
                    className="w-32 px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">.{customDomain || 'yourdomain.com'}</span>
                  <Button
                    onClick={handleAddDomain}
                    disabled={isAddingDomain || !customDomain.trim() || !subdomain.trim()}
                    variant="hero"
                    size="default"
                    className="ml-auto"
                  >
                    {isAddingDomain ? 'Adding...' : 'Add Domain'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">Choose a subdomain for your links (e.g., link, go, app). Your final URL will be: {subdomain || 'link'}.{customDomain || 'yourdomain.com'}</p>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="mt-6 text-center py-8">
                  <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                  <p className="text-sm text-gray-500 mt-3">Loading domains...</p>
                </div>
              )}

              {/* Added Domains List */}
              {!isLoading && domains.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Added Domains</h3>
                  {domains.map((domainItem) => (
                    <div key={domainItem._id || domainItem.id} className="p-4 sm:p-5 bg-gray-100 border border-gray-200 rounded-xl">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <p className="text-sm font-medium text-gray-900">
                              {domainItem.subdomain ? `${domainItem.subdomain}.${domainItem.domain}` : domainItem.domain}
                            </p>
                            {getStatusBadge(domainItem.status)}
                          </div>
                          {domainItem.status === 'verified' && domainItem.verifiedAt && (
                            <p className="text-xs text-gray-500">Verified on {new Date(domainItem.verifiedAt).toLocaleDateString()}</p>
                          )}
                        </div>
                        <Button
                          onClick={() => handleRemoveDomain(domainItem._id || domainItem.id, domainItem.subdomain ? `${domainItem.subdomain}.${domainItem.domain}` : domainItem.domain)}
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive/30 hover:bg-destructive/10 flex-shrink-0"
                        >
                          Remove
                        </Button>
                      </div>

                      {/* DNS Configuration Instructions */}
                      {domainItem.status !== 'verified' && (
                        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl">
                          <h4 className="text-xs font-semibold text-gray-900 mb-2">DNS Configuration Required</h4>
                          <p className="text-xs text-gray-500 mb-3">Add the following CNAME record to verify ownership of your domain:</p>
                          <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
                            <div className="text-xs font-mono space-y-2 text-gray-900">
                              <div className="flex items-center gap-2 mb-1"><span className="text-primary font-semibold">Type:</span> <span>CNAME</span></div>
                              <div className="flex items-center gap-2 mb-1"><span className="text-primary font-semibold">Name:</span> <span>{domainItem.subdomain || 'link'}</span></div>
                              <div className="flex items-start gap-2"><span className="text-primary font-semibold">Value:</span> <span className="break-all">{domainItem.cnameTarget || 'target.lorrymithra.in'}</span></div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            <Button
                              onClick={() => handleVerifyDomain(domainItem._id || domainItem.id)}
                              disabled={verifyingDomain === (domainItem._id || domainItem.id)}
                              variant="hero"
                              size="default"
                            >
                              {verifyingDomain === (domainItem._id || domainItem.id) ? <><Loader2 className="animate-spin w-4 h-4 mr-2" /> Verifying...</> : 'Verify Domain'}
                            </Button>
                            {domainItem.status === 'failed' && (
                              <Button onClick={() => handleVerifyDomain(domainItem._id || domainItem.id)} disabled={verifyingDomain === (domainItem._id || domainItem.id)} variant="hero-outline" size="default">
                                Retry Verification
                              </Button>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-3">After adding the CNAME record, click &quot;Verify Domain&quot; to check. DNS changes may take up to 48 hours to propagate.</p>
                        </div>
                      )}

                      {/* Verified Domain Success */}
                      {domainItem.status === 'verified' && (
                        <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-xl">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 mb-1">Domain Verified Successfully</p>
                              <p className="text-xs text-gray-500">Your domain is now active and ready to use. All links created will use this custom domain.</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Information Card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                <Info className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">About Custom Domains</h3>
                <p className="text-xs text-gray-500 mb-2">Custom domains allow you to use your own domain name for your short links, making them more professional and branded.</p>
                <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                  <li>Your domain must be verified via CNAME record before use</li>
                  <li>Point your subdomain to <strong className="text-gray-900">target.lorrymithra.in</strong></li>
                  <li>SSL certificate will be automatically provisioned</li>
                  <li>You can add multiple custom domains</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Settings;

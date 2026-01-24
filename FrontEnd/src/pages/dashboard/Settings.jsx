import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Verified
          </span>
        );
      case 'verifying':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <svg className="animate-spin w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Verifying...
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Pending Verification
          </span>
        );
    }
  };

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account settings">
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Custom Domain Section */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Custom Domain</h2>
                <p className="text-sm text-gray-600">
                  Add your own custom domain to use with your links instead of the default chottu.link domain.
                </p>
              </div>
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start justify-between">
                <p className="text-sm text-green-600">{successMessage}</p>
                <button
                  onClick={() => setSuccessMessage(null)}
                  className="text-green-600 hover:text-green-800 ml-4"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800 ml-4"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}

            {/* Verification Error Message */}
            {verificationError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between">
                <p className="text-sm text-red-600">{verificationError}</p>
                <button
                  onClick={() => setVerificationError(null)}
                  className="text-red-600 hover:text-red-800 ml-4"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}

            {/* Domain Input Section */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domain Name
                </label>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => {
                      setCustomDomain(e.target.value);
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    placeholder="example.com"
                    className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter your domain name without http:// or https:// (e.g., example.com)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subdomain
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => {
                      setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    placeholder="link"
                    className="w-32 px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-sm text-gray-500">.{customDomain || 'yourdomain.com'}</span>
                  <button
                    onClick={handleAddDomain}
                    disabled={isAddingDomain || !customDomain.trim() || !subdomain.trim()}
                    className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed ml-auto"
                  >
                    {isAddingDomain ? 'Adding...' : 'Add Domain'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Choose a subdomain for your links (e.g., link, go, app). Your final URL will be: {subdomain || 'link'}.{customDomain || 'yourdomain.com'}
                </p>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="mt-6 text-center py-4">
                  <svg className="animate-spin h-5 w-5 text-blue-600 mx-auto" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="text-sm text-gray-500 mt-2">Loading domains...</p>
                </div>
              )}

              {/* Added Domains List */}
              {!isLoading && domains.length > 0 && (
                <div className="mt-6 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-900">Added Domains</h3>
                  {domains.map((domainItem) => (
                    <div key={domainItem._id || domainItem.id} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="text-sm font-medium text-gray-900">
                              {domainItem.subdomain ? `${domainItem.subdomain}.${domainItem.domain}` : domainItem.domain}
                            </p>
                            {getStatusBadge(domainItem.status)}
                          </div>
                          {domainItem.status === 'verified' && domainItem.verifiedAt && (
                            <p className="text-xs text-gray-500">
                              Verified on {new Date(domainItem.verifiedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveDomain(
                            domainItem._id || domainItem.id, 
                            domainItem.subdomain ? `${domainItem.subdomain}.${domainItem.domain}` : domainItem.domain
                          )}
                          className="px-3 py-1.5 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          Remove
                        </button>
                      </div>

                      {/* DNS Configuration Instructions */}
                      {domainItem.status !== 'verified' && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="text-xs font-semibold text-blue-900 mb-2">DNS Configuration Required</h4>
                          <p className="text-xs text-blue-700 mb-3">
                            Add the following CNAME record to verify ownership of your domain:
                          </p>
                          <div className="bg-white rounded border border-blue-200 p-3 mb-3">
                            <div className="text-xs font-mono space-y-2">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-blue-600 font-semibold">Type:</span>
                                <span>CNAME</span>
                              </div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-blue-600 font-semibold">Name:</span>
                                <span>{domainItem.subdomain || 'link'}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <span className="text-blue-600 font-semibold">Value:</span>
                                <span className="break-all">{domainItem.cnameTarget || 'target.lorrymithra.in'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleVerifyDomain(domainItem._id || domainItem.id)}
                              disabled={verifyingDomain === (domainItem._id || domainItem.id)}
                              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                              {verifyingDomain === (domainItem._id || domainItem.id) ? (
                                <>
                                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Verifying...
                                </>
                              ) : (
                                'Verify Domain'
                              )}
                            </button>
                            {domainItem.status === 'failed' && (
                              <button
                                onClick={() => handleVerifyDomain(domainItem._id || domainItem.id)}
                                disabled={verifyingDomain === (domainItem._id || domainItem.id)}
                                className="px-4 py-2 text-sm font-medium text-blue-600 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                              >
                                Retry Verification
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-blue-700 mt-3">
                            After adding the CNAME record, click "Verify Domain" to check. DNS changes may take up to 48 hours to propagate.
                          </p>
                        </div>
                      )}

                      {/* Verified Domain Success */}
                      {domainItem.status === 'verified' && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <div>
                              <p className="text-sm font-medium text-green-900 mb-1">Domain Verified Successfully</p>
                              <p className="text-xs text-green-700">
                                Your domain is now active and ready to use. All links created will use this custom domain.
                              </p>
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
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">About Custom Domains</h3>
                <p className="text-xs text-blue-700 mb-2">
                  Custom domains allow you to use your own domain name for your short links, making them more professional and branded.
                </p>
                <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                  <li>Your domain must be verified via CNAME record before use</li>
                  <li>Point your subdomain to <strong>target.lorrymithra.in</strong></li>
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

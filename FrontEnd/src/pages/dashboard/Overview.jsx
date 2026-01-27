import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { createAppWithConfigurations, getUserApps } from '../../services/appService';
import { getCurrentUser } from '../../services/authService';
import { getDomains, addDomain, verifyDomain } from '../../services/domainService';

/**
 * Overview Page - Getting Started Form
 */
export const Overview = () => {
  const [subdomain, setSubdomain] = useState('');
  const [fallbackUrl, setFallbackUrl] = useState('');
  const [androidRedirectUrl, setAndroidRedirectUrl] = useState('');
  const [hasAndroidApp, setHasAndroidApp] = useState(false);
  const [androidPackageName, setAndroidPackageName] = useState('');
  const [enableAppLinks, setEnableAppLinks] = useState(false);
  const [sha256Fingerprint, setSha256Fingerprint] = useState('');
  const [iosRedirectUrl, setIosRedirectUrl] = useState('');
  const [hasIosApp, setHasIosApp] = useState(false);
  const [appleTeamId, setAppleTeamId] = useState('');
  const [appleBundleId, setAppleBundleId] = useState('');
  const [appStoreId, setAppStoreId] = useState('');
  const [enableUniversalLinks, setEnableUniversalLinks] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAppExists, setIsAppExists] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [domainType, setDomainType] = useState('subdomain'); // 'subdomain' or 'custom'
  const [customDomains, setCustomDomains] = useState([]);
  const [selectedCustomDomain, setSelectedCustomDomain] = useState(null);
  // New custom domain input states
  const [newCustomDomain, setNewCustomDomain] = useState('');
  const [newCustomSubdomain, setNewCustomSubdomain] = useState('link');
  const [isAddingCustomDomain, setIsAddingCustomDomain] = useState(false);
  const [customDomainError, setCustomDomainError] = useState(null);
  const [showAddDomainForm, setShowAddDomainForm] = useState(false);
  const [dnsSetupConfirmed, setDnsSetupConfirmed] = useState(false);
  const [userApps, setUserApps] = useState([]);
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null); // For viewing app details

  // Check if app exists and fetch custom domains on component mount
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Check app existence
        const result = await getCurrentUser();
        if (result.success) {
          setIsAppExists(result.isAppExists || false);
          setUserInfo({
            userType: result.userType,
            currentPlan: result.currentPlan,
          });

          // Fetch user apps if app exists
          if (result.isAppExists) {
            setIsLoadingApps(true);
            try {
              const appsResult = await getUserApps();
              if (appsResult.success && appsResult.apps) {
                setUserApps(appsResult.apps);
                console.log('[Overview] User apps:', appsResult.apps);
              }
            } catch (appErr) {
              console.error('[Overview] Error fetching user apps:', appErr);
            } finally {
              setIsLoadingApps(false);
            }
          }
        }

        // Fetch custom domains (including pending ones)
        try {
          const domainsResult = await getDomains();
          console.log('[Overview] Domains API result:', domainsResult);
          if (domainsResult.success && domainsResult.domains) {
            console.log('[Overview] All domains:', domainsResult.domains);
            // Include all domains (verified and pending) so users can verify them
            setCustomDomains(domainsResult.domains);
          }
        } catch (domainErr) {
          console.error('[Overview] Error fetching custom domains:', domainErr);
        }
      } catch (err) {
        console.error('Error checking app existence:', err);
        // Fallback: check localStorage
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          try {
            const parsed = JSON.parse(cachedUser);
            setIsAppExists(parsed.isAppExists || false);
          } catch (e) {
            console.error('Error parsing cached user:', e);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  const handleStepContinue = async (stepNumber, value) => {
    if (value && value.trim() !== '') {
      setError(null);
      setSuccessMessage(null);

      // Handle final submission (Step 4) - Submit all configurations in one request
      if (stepNumber === 4) {
        // Validate required fields only on final submission
        if (!subdomain || subdomain.trim() === '') {
          setError('Please complete step 1 (domain) first.');
          return;
        }

        // For subdomain type, validate length
        if (domainType === 'subdomain' && (subdomain.trim().length < 3 || subdomain.trim().length > 15)) {
          setError('Subdomain must be 3-15 characters.');
          return;
        }

        if (!fallbackUrl || fallbackUrl.trim() === '') {
          setError('Please complete step 2 (fallback URL) first.');
          return;
        }
        setIsSubmitting(true);
        
        try {
          // Build the app configuration payload
          // If using custom domain, use it directly; otherwise append .chottu.link
          const finalDomain = domainType === 'custom' && selectedCustomDomain
            ? `${selectedCustomDomain.subdomain}.${selectedCustomDomain.domain}`
            : `${subdomain.trim()}.chottu.link`;

          const appConfig = {
            name: subdomain.trim().substring(0, 15).replace(/\./g, '-'), // Remove dots for name
            subDomain: finalDomain,
            fallbackUrl: fallbackUrl.trim(),
            android: null,
            ios: null,
            // Include domainId if using custom domain
            domainId: (domainType === 'custom' && selectedCustomDomain?._id) ? selectedCustomDomain._id : null,
          };

          // Add Android configuration if applicable
          if (hasAndroidApp && androidPackageName.trim() !== '') {
            appConfig.android = {
              packageName: androidPackageName.trim(),
            };
            if (sha256Fingerprint.trim() !== '') {
              appConfig.android.fingerPrint = sha256Fingerprint.trim();
            }
          }

          // Add iOS configuration if applicable
          if (hasIosApp && appleBundleId.trim() !== '' && appleTeamId.trim() !== '') {
            appConfig.ios = {
              teamId: appleTeamId.trim(),
              bundleId: appleBundleId.trim(),
            };
            if (appStoreId.trim() !== '') {
              appConfig.ios.storeId = appStoreId.trim();
            }
          }

          // Submit the app configuration
          await createAppWithConfigurations(appConfig);
          setSuccessMessage('App configuration created successfully!');
          
          // Refresh user data to get updated isAppExists status
          try {
            const result = await getCurrentUser();
            if (result.success) {
              setIsAppExists(result.isAppExists || true);
              setUserInfo({
                userType: result.userType,
                currentPlan: result.currentPlan,
              });
            }
          } catch (err) {
            console.error('Error refreshing user data:', err);
          }
          
          setIsSubmitted(true); // Mark as submitted to show success page
        } catch (err) {
          setError(err.message || 'Failed to create app configuration');
          setIsSubmitting(false);
          return; // Don't mark as completed if there are errors
        }

        setIsSubmitting(false);
      }

      setCompletedSteps([...completedSteps, stepNumber]);
      if (stepNumber < 4) {
        setCurrentStep(stepNumber + 1);
      }
    }
  };

  const isStepCompleted = (stepNumber) => completedSteps.includes(stepNumber);
  const isStepActive = (stepNumber) => currentStep >= stepNumber;

  // Handle adding a new custom domain
  const handleAddCustomDomain = async () => {
    if (!newCustomDomain.trim()) {
      setCustomDomainError('Please enter a domain name');
      return;
    }

    if (!newCustomSubdomain.trim()) {
      setCustomDomainError('Please enter a subdomain');
      return;
    }

    // Basic domain validation
    const domainPattern = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    if (!domainPattern.test(newCustomDomain.trim())) {
      setCustomDomainError('Please enter a valid domain name (e.g., example.com)');
      return;
    }

    // Subdomain validation
    const subdomainPattern = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/i;
    if (!subdomainPattern.test(newCustomSubdomain.trim())) {
      setCustomDomainError('Please enter a valid subdomain (letters, numbers, hyphens only)');
      return;
    }

    setIsAddingCustomDomain(true);
    setCustomDomainError(null);

    try {
      const result = await addDomain({
        domain: newCustomDomain.trim(),
        subdomain: newCustomSubdomain.trim()
      });

      if (result.success) {
        // Refresh domains list
        const domainsResult = await getDomains();
        if (domainsResult.success && domainsResult.domains) {
          setCustomDomains(domainsResult.domains);
          // Select the newly added domain (it will be pending verification)
          const newDomain = domainsResult.domains.find(
            d => d.domain === newCustomDomain.trim().toLowerCase() && 
                 d.subdomain === newCustomSubdomain.trim().toLowerCase()
          );
          if (newDomain) {
            setSelectedCustomDomain(newDomain);
            setSubdomain(`${newDomain.subdomain}.${newDomain.domain}`);
            setDnsSetupConfirmed(false); // Reset so they see DNS instructions
          }
        }
        setShowAddDomainForm(false);
        setNewCustomDomain('');
        setNewCustomSubdomain('link');
      }
    } catch (err) {
      console.error('Error adding custom domain:', err);
      setCustomDomainError(err.message || 'Failed to add domain. Please try again.');
    } finally {
      setIsAddingCustomDomain(false);
    }
  };

  // Refresh domains list
  const refreshDomains = async () => {
    try {
      const domainsResult = await getDomains();
      if (domainsResult.success && domainsResult.domains) {
        setCustomDomains(domainsResult.domains);
      }
    } catch (err) {
      console.error('Error refreshing domains:', err);
    }
  };

  const CheckIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  );

  const SuccessIcon = ({ className }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  // Show submitted success page
  if (isSubmitted) {
    return (
      <DashboardLayout title="Overview" subtitle="Home">
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center">
                {/* Success Icon */}
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                  <SuccessIcon className="h-10 w-10 text-green-600" />
                </div>

                {/* Success Message */}
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                  Configuration Submitted Successfully!
                </h2>
                <p className="text-base sm:text-lg text-gray-600 mb-8">
                  Your app configuration has been created successfully. You can now start creating and managing your deep links.
                </p>

                {/* Configuration Summary */}
                <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Subdomain:</span>
                      <span className="text-sm font-medium text-gray-900">{subdomain}.chottu.link</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Fallback URL:</span>
                      <span className="text-sm font-medium text-gray-900 break-all">{fallbackUrl}</span>
                    </div>
                    {hasAndroidApp && androidPackageName && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Android Package:</span>
                        <span className="text-sm font-medium text-gray-900">{androidPackageName}</span>
                      </div>
                    )}
                    {hasIosApp && appleBundleId && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">iOS Bundle ID:</span>
                        <span className="text-sm font-medium text-gray-900">{appleBundleId}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => window.location.href = '/dashboard/links'}
                    className="px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Link
                  </button>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Edit Configuration
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <DashboardLayout title="Overview" subtitle="Home">
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Loading...</p>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  // Show app exists view if app already exists
  if (isAppExists) {
    return (
      <DashboardLayout title="Overview" subtitle="Home">
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Apps List Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Your Apps
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Manage your configured applications
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {userInfo?.currentPlan && (
                      <div className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        {userInfo.currentPlan}
                      </div>
                    )}
                    <button
                      onClick={() => setIsAppExists(false)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add New App
                    </button>
                  </div>
                </div>

                {/* Apps List */}
                {isLoadingApps ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">Loading apps...</span>
                  </div>
                ) : userApps.length > 0 ? (
                  <div className="space-y-3">
                    {userApps.map((app) => (
                      <div
                        key={app._id}
                        onClick={() => setSelectedApp(selectedApp?._id === app._id ? null : app)}
                        className={`border rounded-lg p-4 transition-all cursor-pointer group ${
                          selectedApp?._id === app._id 
                            ? 'border-blue-400 bg-blue-50/50 shadow-md' 
                            : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                              {app.name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {app.name || 'Unnamed App'}
                              </h3>
                              <p className="text-xs text-gray-500 flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                {app.subDomain || 'No domain'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Domain verification status */}
                            {app.domainId ? (
                              app.domainId.status === 'verified' ? (
                                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Verified
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  Pending
                                </span>
                              )
                            ) : app.subDomain?.endsWith('.chottu.link') ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                Active
                              </span>
                            ) : app.fallbackUrl ? (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                                No Domain
                              </span>
                            ) : null}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedApp(selectedApp?._id === app._id ? null : app);
                              }}
                              className={`p-1.5 rounded-lg transition-all ${
                                selectedApp?._id === app._id 
                                  ? 'bg-blue-100 text-blue-600' 
                                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                              }`}
                              title={selectedApp?._id === app._id ? 'Close' : 'Open'}
                            >
                              <svg 
                                className={`w-5 h-5 transition-transform duration-200 ${
                                  selectedApp?._id === app._id ? 'rotate-180' : ''
                                }`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/dashboard/links?app=${app._id}`;
                              }}
                              className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              Links
                            </button>
                            {/* <button
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `/dashboard/settings?app=${app._id}`;
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Settings"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </button> */}
                          </div>
                        </div>
                        {/* App Details Summary */}
                        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-4 text-xs text-gray-500">
                          {app.fallbackUrl && (
                            <div className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                              <span className="truncate max-w-[200px]">{app.fallbackUrl}</span>
                            </div>
                          )}
                        </div>

                        {/* Expanded App Details Panel */}
                        {selectedApp?._id === app._id && (
                          <div className="mt-4 pt-4 border-t border-blue-200 bg-blue-50/50 -mx-4 -mb-4 px-4 pb-4 rounded-b-lg">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              App Configuration
                            </h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Domain Info */}
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-xs font-medium text-gray-500 mb-1">Domain</p>
                                <p className="text-sm font-semibold text-gray-900">{app.subDomain || 'Not configured'}</p>
                                {app.domainId && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Status: {app.domainId.status === 'verified' ? (
                                      <span className="text-green-600">✓ Verified</span>
                                    ) : (
                                      <span className="text-yellow-600">⏳ Pending verification</span>
                                    )}
                                  </p>
                                )}
                              </div>

                              {/* Fallback URL */}
                              <div className="bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-xs font-medium text-gray-500 mb-1">Fallback URL</p>
                                <p className="text-sm text-gray-900 truncate" title={app.fallbackUrl}>
                                  {app.fallbackUrl || 'Not configured'}
                                </p>
                              </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-4 flex flex-wrap gap-2">
                              <a
                                href={`https://${app.subDomain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-1"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Visit Domain
                              </a>
                              <button
                                onClick={() => window.location.href = `/dashboard/links?app=${app._id}`}
                                className="px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-1"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                Manage Links
                              </button>
                              <button
                                onClick={() => window.location.href = `/dashboard/analytics?app=${app._id}`}
                                className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-1"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Analytics
                              </button>
                              <button
                                onClick={() => window.location.href = `/dashboard/settings?app=${app._id}`}
                                className="px-3 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center gap-1"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                Settings
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add New App Card */}
                    {/* <button
                      onClick={() => setIsAppExists(false)}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group w-full"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 group-hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors">
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-600 group-hover:text-blue-600 transition-colors">
                            Add New App
                          </h3>
                          <p className="text-xs text-gray-400 group-hover:text-blue-500 transition-colors">
                            Configure another application
                          </p>
                        </div>
                      </div>
                    </button> */}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-gray-500 mb-4">No apps found</p>
                    <button
                      onClick={() => setIsAppExists(false)}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Your First App
                    </button>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => window.location.href = '/dashboard/links'}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create New Link
                    </button>
                    <button
                      onClick={() => window.location.href = '/dashboard/analytics'}
                      className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      View Analytics
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Cards */}
              <div className="space-y-4 sm:space-y-6 lg:col-span-1">
                {/* Quick Stats Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Stats
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Apps</span>
                      <span className="text-lg font-bold text-gray-900">{userApps.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Domains</span>
                      <span className="text-lg font-bold text-gray-900">{userApps.filter(a => a.subDomain).length}</span>
                    </div>
                  </div>
                </div>

                {/* Integration Guide Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2 sm:mb-3">
                    Integration Guide
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                    Easily create, customize, and manage links with our SDK. Follow simple steps to integrate ChottulinksDK into your app.
                  </p>
                  <a
                    href="#"
                    className="text-sm text-blue-600 hover:text-blue-700 underline font-medium"
                  >
                    Go To Docs
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Overview" subtitle="Home">
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Getting Started Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 lg:col-span-2">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {userApps.length > 0 ? 'Add New App' : 'Getting Started with ChottuLink!'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {userApps.length > 0 ? 'Configure a new application' : 'Fill the form to get full access to your workspace'}
                  </p>
                </div>
                {userApps.length > 0 && (
                  <button
                    onClick={() => setIsAppExists(true)}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Apps
                  </button>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">{successMessage}</p>
                </div>
              )}

              <div className="space-y-6">
                {/* Step 1: Choose subdomain */}
                <div className={isStepActive(1) ? 'opacity-100' : 'opacity-50 pointer-events-none'}>
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isStepCompleted(1) 
                        ? 'bg-green-500 text-white' 
                        : currentStep === 1 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isStepCompleted(1) ? (
                        <CheckIcon className="w-4 h-4" />
                      ) : (
                        '1'
                      )}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        Choose your domain:
                      </h3>
                      <p className="text-xs text-gray-600 mb-3">
                        Pick a subdomain or use your custom domain if you have one verified.
                      </p>

                      {/* Domain Type Toggle */}
                      <div className="flex gap-2 mb-3">
                        <button
                          onClick={() => {
                            setDomainType('subdomain');
                            setShowAddDomainForm(false);
                          }}
                          disabled={!isStepActive(1)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            domainType === 'subdomain'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          Subdomain (.chottu.link)
                        </button>
                        <button
                          onClick={() => setDomainType('custom')}
                          disabled={!isStepActive(1)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            domainType === 'custom'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          Custom Domain {customDomains.length > 0 && `(${customDomains.length})`}
                        </button>
                      </div>

                      {/* Subdomain Input */}
                      {domainType === 'subdomain' && (
                        <div className="flex gap-2">
                          <div className="flex-1 relative flex items-center">
                            <span className="absolute left-3 text-sm text-gray-500 pointer-events-none z-10">
                              https://
                            </span>
                            <input
                              type="text"
                              value={subdomain}
                              onChange={(e) => setSubdomain(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && subdomain.trim() !== '') {
                                  handleStepContinue(1, subdomain);
                                }
                              }}
                              disabled={!isStepActive(1)}
                              className="w-full pl-[72px] pr-[100px] py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                              placeholder="select-subdomain"
                            />
                            <span className="absolute right-3 text-sm text-gray-500 pointer-events-none">
                              .chottu.link
                            </span>
                          </div>
                          <button
                            onClick={() => handleStepContinue(1, subdomain)}
                            disabled={!subdomain || subdomain.trim() === '' || !isStepActive(1)}
                            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            Continue
                          </button>
                        </div>
                      )}

                      {/* Custom Domain Selection */}
                      {domainType === 'custom' && (
                        <div className="space-y-3">
                          {/* Existing domains dropdown */}
                          {customDomains.length > 0 && !showAddDomainForm && (
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <select
                                  value={selectedCustomDomain ? `${selectedCustomDomain.subdomain}.${selectedCustomDomain.domain}` : ''}
                                  onChange={(e) => {
                                    const selectedValue = e.target.value;
                                    const domain = customDomains.find(d => `${d.subdomain}.${d.domain}` === selectedValue);
                                    setSelectedCustomDomain(domain);
                                    setDnsSetupConfirmed(false); // Reset confirmation when domain changes
                                    if (domain) {
                                      setSubdomain(`${domain.subdomain}.${domain.domain}`);
                                    }
                                  }}
                                  disabled={!isStepActive(1)}
                                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                >
                                  <option value="">Select a custom domain</option>
                                  {customDomains.map((d) => (
                                    <option key={d._id} value={`${d.subdomain}.${d.domain}`}>
                                      {d.subdomain}.{d.domain} {d.status === 'verified' ? '✓' : ''}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              {/* Continue button - enabled for verified OR confirmed pending domains */}
                              <button
                                onClick={() => {
                                  if (selectedCustomDomain) {
                                    handleStepContinue(1, `${selectedCustomDomain.subdomain}.${selectedCustomDomain.domain}`);
                                  }
                                }}
                                disabled={!selectedCustomDomain || (selectedCustomDomain?.status !== 'verified' && !dnsSetupConfirmed) || !isStepActive(1)}
                                className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap disabled:bg-gray-300 disabled:cursor-not-allowed"
                              >
                                Continue
                              </button>
                            </div>
                          )}

                          {/* DNS Setup Instructions for pending domains */}
                          {selectedCustomDomain && selectedCustomDomain.status !== 'verified' && !showAddDomainForm && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <p className="text-xs text-blue-800 mb-2 font-semibold">
                                📋 DNS Configuration Required
                              </p>
                              <div className="text-xs text-blue-700 mb-3">
                                <p className="mb-2">Add this CNAME record to your DNS provider:</p>
                                <div className="bg-white p-2 rounded border border-blue-200 font-mono text-xs">
                                  <p>Type: <strong>CNAME</strong></p>
                                  <p>Name: <strong>{selectedCustomDomain.subdomain}</strong></p>
                                  <p>Value: <strong>{selectedCustomDomain.cnameTarget || 'target.lorrymithra.in'}</strong></p>
                                </div>
                              </div>
                              
                              {/* Confirmation checkbox */}
                              <label className="flex items-start gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={dnsSetupConfirmed}
                                  onChange={(e) => setDnsSetupConfirmed(e.target.checked)}
                                  className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-xs text-blue-800">
                                  I have configured the CNAME record in my DNS settings
                                </span>
                              </label>
                              
                              {dnsSetupConfirmed && (
                                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Great! You can now continue. DNS changes may take up to 48 hours to propagate.
                                </p>
                              )}
                            </div>
                          )}

                          {/* Verified domain success message */}
                          {selectedCustomDomain && selectedCustomDomain.status === 'verified' && !showAddDomainForm && (
                            <div className="p-2 bg-green-50 border border-green-200 rounded-lg">
                              <p className="text-xs text-green-700 flex items-center gap-1">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Domain verified and ready to use!
                              </p>
                            </div>
                          )}

                          {/* Add new domain button */}
                          {!showAddDomainForm && (
                            <button
                              onClick={() => setShowAddDomainForm(true)}
                              disabled={!isStepActive(1)}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Add a new custom domain
                            </button>
                          )}

                          {/* Add new domain form */}
                          {showAddDomainForm && (
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                              <h4 className="text-sm font-semibold text-gray-900">Add Custom Domain</h4>
                              
                              {customDomainError && (
                                <p className="text-xs text-red-600">{customDomainError}</p>
                              )}

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Domain</label>
                                <input
                                  type="text"
                                  value={newCustomDomain}
                                  onChange={(e) => {
                                    setNewCustomDomain(e.target.value);
                                    setCustomDomainError(null);
                                  }}
                                  placeholder="example.com"
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Subdomain</label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={newCustomSubdomain}
                                    onChange={(e) => {
                                      setNewCustomSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
                                      setCustomDomainError(null);
                                    }}
                                    placeholder="link"
                                    className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-500">.{newCustomDomain || 'yourdomain.com'}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  Your links will be: {newCustomSubdomain || 'link'}.{newCustomDomain || 'yourdomain.com'}/your-path
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={handleAddCustomDomain}
                                  disabled={isAddingCustomDomain || !newCustomDomain.trim() || !newCustomSubdomain.trim()}
                                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                  {isAddingCustomDomain ? 'Adding...' : 'Add Domain'}
                                </button>
                                <button
                                  onClick={() => {
                                    setShowAddDomainForm(false);
                                    setNewCustomDomain('');
                                    setNewCustomSubdomain('link');
                                    setCustomDomainError(null);
                                  }}
                                  className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800"
                                >
                                  Cancel
                                </button>
                              </div>

                              <p className="text-xs text-gray-500">
                                After adding, you'll need to verify the domain by adding a CNAME record to your DNS.
                              </p>
                            </div>
                          )}

                          {/* No domains message */}
                          {customDomains.length === 0 && !showAddDomainForm && (
                            <p className="text-xs text-gray-500">
                              No custom domains added yet. Click "Add a new custom domain" to get started.
                            </p>
                          )}
                        </div>
                      )}

                      {/* Hint for subdomain mode */}
                      {domainType === 'subdomain' && (
                        <p className="text-xs text-gray-500 mt-2">
                          💡 Want to use your own domain? Switch to "Custom Domain" above.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Step 2: Default fallback URL */}
                <div className={isStepActive(2) ? 'opacity-100' : 'opacity-50 pointer-events-none'}>
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isStepCompleted(2) 
                        ? 'bg-green-500 text-white' 
                        : currentStep === 2 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isStepCompleted(2) ? (
                        <CheckIcon className="w-4 h-4" />
                      ) : (
                        '2'
                      )}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        Default fallback URL:
                      </h3>
                      <p className="text-xs text-gray-600 mb-3">
                        Your fallback URL for mobile devices that do not have a specified redirect.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={fallbackUrl}
                          onChange={(e) => setFallbackUrl(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && fallbackUrl.trim() !== '') {
                              handleStepContinue(2, fallbackUrl);
                            }
                          }}
                          disabled={!isStepActive(2)}
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="https://example.com/fallback"
                        />
                        <button
                          onClick={() => handleStepContinue(2, fallbackUrl)}
                          disabled={!fallbackUrl || fallbackUrl.trim() === '' || !isStepActive(2)}
                          className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          Continue
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 3: Android Configuration */}
                <div className={isStepActive(3) ? 'opacity-100' : 'opacity-50 pointer-events-none'}>
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isStepCompleted(3) 
                        ? 'bg-green-500 text-white' 
                        : currentStep === 3 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isStepCompleted(3) ? (
                        <CheckIcon className="w-4 h-4" />
                      ) : (
                        '3'
                      )}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        Android Configuration:
                      </h3>
                      <p className="text-xs text-gray-600 mb-3">
                        Set Redirect URL where Android users should land.
                      </p>
                      
                      {/* I have an Android App checkbox */}
                      <div className="mb-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasAndroidApp}
                            onChange={(e) => setHasAndroidApp(e.target.checked)}
                            disabled={!isStepActive(3)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                          <span className="text-sm text-gray-700">I have an Android App</span>
                        </label>
                      </div>

                      {hasAndroidApp && (
                        <div className="space-y-3 mb-3">
                          {/* Package name */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Package name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={androidPackageName}
                              onChange={(e) => setAndroidPackageName(e.target.value)}
                              disabled={!isStepActive(3)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                              placeholder="e.g. com.example.myapp"
                            />
                            <p className="text-xs text-gray-500 mt-1">Sends Android users to the specified URL</p>
                          </div>

                          {/* Enable App Links checkbox */}
                          <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={enableAppLinks}
                                onChange={(e) => setEnableAppLinks(e.target.checked)}
                                disabled={!isStepActive(3)}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                              />
                              <span className="text-sm text-gray-700">Enable App Links</span>
                            </label>
                          </div>

                          {/* SHA256 Fingerprint */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              SHA256 certificate fingerprints
                            </label>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              SHA256 Fingerprint
                            </label>
                            <input
                              type="text"
                              value={sha256Fingerprint}
                              onChange={(e) => setSha256Fingerprint(e.target.value)}
                              disabled={!isStepActive(3)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                              placeholder="e.g. AB:CD:EF:12:34:56:78:90:12:34:56:78:90:AB:CD:EF:12:34:56:78"
                            />
                          </div>
                        </div>
                      )}

                      {/* Redirect URL */}
                      <div className="mb-3">
                        <input
                          type="url"
                          value={androidRedirectUrl}
                          onChange={(e) => setAndroidRedirectUrl(e.target.value)}
                          disabled={!isStepActive(3)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="https://play.google.com/store/apps/details?id=..."
                        />
                      </div>

                      {/* Continue button */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const isValid = androidRedirectUrl.trim() !== '' && (!hasAndroidApp || androidPackageName.trim() !== '');
                            if (isValid) {
                              handleStepContinue(3, androidRedirectUrl);
                            }
                          }}
                          disabled={!androidRedirectUrl || androidRedirectUrl.trim() === '' || (hasAndroidApp && !androidPackageName.trim()) || !isStepActive(3) || isSubmitting}
                          className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Creating...' : 'Continue'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step 4: iOS Configuration */}
                <div className={isStepActive(4) ? 'opacity-100' : 'opacity-50 pointer-events-none'}>
                  <div className="flex items-start gap-3 mb-3">
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold ${
                      isStepCompleted(4) 
                        ? 'bg-green-500 text-white' 
                        : currentStep === 4 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-gray-300 text-gray-600'
                    }`}>
                      {isStepCompleted(4) ? (
                        <CheckIcon className="w-4 h-4" />
                      ) : (
                        '4'
                      )}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        iOS Configuration:
                      </h3>
                      <p className="text-xs text-gray-600 mb-3">
                        Set Redirect URL where iOS users should land.
                      </p>
                      
                      {/* I have an iOS App checkbox */}
                      <div className="mb-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={hasIosApp}
                            onChange={(e) => setHasIosApp(e.target.checked)}
                            disabled={!isStepActive(4)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                          <span className="text-sm text-gray-700">I have an iOS App</span>
                        </label>
                      </div>

                      {hasIosApp && (
                        <div className="space-y-3 mb-3">
                          {/* Apple Team ID */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Apple Team ID <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={appleTeamId}
                              onChange={(e) => setAppleTeamId(e.target.value)}
                              disabled={!isStepActive(4)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                              placeholder="e.g. 1A2BC3D4EF"
                            />
                          </div>

                          {/* Apple Bundle ID */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Apple Bundle ID <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={appleBundleId}
                              onChange={(e) => setAppleBundleId(e.target.value)}
                              disabled={!isStepActive(4)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                              placeholder="e.g. com.example.myapp"
                            />
                          </div>

                          {/* App Store ID */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              App Store ID
                            </label>
                            <input
                              type="text"
                              value={appStoreId}
                              onChange={(e) => setAppStoreId(e.target.value)}
                              disabled={!isStepActive(4)}
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                              placeholder="e.g. 1234567890"
                            />
                          </div>

                          {/* Enable Universal Links checkbox */}
                          <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={enableUniversalLinks}
                                onChange={(e) => setEnableUniversalLinks(e.target.checked)}
                                disabled={!isStepActive(4)}
                                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                              />
                              <span className="text-sm text-gray-700">Enable Universal Links</span>
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Redirect URL */}
                      <div className="mb-3">
                        <input
                          type="url"
                          value={iosRedirectUrl}
                          onChange={(e) => setIosRedirectUrl(e.target.value)}
                          disabled={!isStepActive(4)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="https://apps.apple.com/app/id..."
                        />
                      </div>

                      {/* Submit button */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const isValid = iosRedirectUrl.trim() !== '' && (!hasIosApp || (appleTeamId.trim() !== '' && appleBundleId.trim() !== ''));
                            if (isValid) {
                              handleStepContinue(4, iosRedirectUrl);
                            }
                          }}
                          disabled={!iosRedirectUrl || iosRedirectUrl.trim() === '' || (hasIosApp && (!appleTeamId.trim() || !appleBundleId.trim())) || !isStepActive(4) || isSubmitting}
                          className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Integration Guide Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 lg:col-span-1">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">
                Integration Guide
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                Easily create, customize, and manage links with our SDK. Follow simple steps to integrate ChottulinksDK into your app.
              </p>
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Go To Docs
              </a>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Overview;

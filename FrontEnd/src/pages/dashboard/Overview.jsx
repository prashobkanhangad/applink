import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { createAppWithConfigurations, getUserApps, getOverviewStats, updateApp } from '../../services/appService';
import { getCurrentUser } from '../../services/authService';
import { getDomains, addDomain, verifyDomain } from '../../services/domainService';

/**
 * Overview Page - Getting Started Form
 */
export const Overview = () => {
  const [subdomain, setSubdomain] = useState('');
  const [appName, setAppName] = useState('');
  const [fallbackUrl, setFallbackUrl] = useState('');
  const [androidRedirectUrl, setAndroidRedirectUrl] = useState('');
  const [hasAndroidApp, setHasAndroidApp] = useState(false);
  const [androidPackageName, setAndroidPackageName] = useState('');
  const [enableAppLinks, setEnableAppLinks] = useState(false);
  const [sha256Fingerprints, setSha256Fingerprints] = useState(['']);
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
  const [domainType, setDomainType] = useState('custom'); // 'subdomain' or 'custom'
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
  const [stats, setStats] = useState({ linksCount: 0, totalClicks: 0, totalInstalls: 0 });
  const [refreshingSdkAppId, setRefreshingSdkAppId] = useState(null); // app _id while refreshing SDK verification
  const [editingApp, setEditingApp] = useState(null); // app being edited (opens modal)
  const [editForm, setEditForm] = useState({
    name: '',
    fallbackUrl: '',
    hasAndroidApp: false,
    hasIosApp: false,
    hadAndroidConfig: false, // true if app already had Android config when modal opened (checkbox cannot be unchecked)
    hadIosConfig: false,
    android: { packageName: '', fingerPrints: [''] },
    ios: { teamId: '', bundleId: '', storeId: '' },
  });
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  // Format number for display (e.g., 1100 -> "1.1K")
  const formatCompact = (n) => n >= 1000 ? (n / 1000).toFixed(1) + 'K' : String(n);

  const SDK_DOCS_URL = 'https://docs.deeplink.in/';
  const SDK_ACTIVITY_STALE_DAYS = 10;
  const SDK_ACTIVITY_STALE_MS = SDK_ACTIVITY_STALE_DAYS * 24 * 60 * 60 * 1000;

  // Verified = config + sdkVerifiedAt + (last SDK activity within 10 days, or no activity recorded yet)
  const isSdkActivityRecent = (lastSdkActivityAt) => {
    if (!lastSdkActivityAt) return true; // no data yet => still show verified if sdkVerifiedAt set
    return Date.now() - new Date(lastSdkActivityAt).getTime() < SDK_ACTIVITY_STALE_MS;
  };
  const getAndroidFingerPrints = (app) => {
    const a = app?.configurations?.android;
    return (a?.fingerPrints || []).filter(Boolean);
  };
  const isAndroidSdkVerified = (app) =>
    !!(app?.configurations?.android?.packageName &&
      getAndroidFingerPrints(app).length > 0 &&
      app?.configurations?.android?.sdkVerifiedAt &&
      isSdkActivityRecent(app?.configurations?.android?.lastSdkActivityAt));
  const isIosSdkVerified = (app) =>
    !!(app?.configurations?.ios?.teamId &&
      app?.configurations?.ios?.bundleId &&
      app?.configurations?.ios?.sdkVerifiedAt &&
      isSdkActivityRecent(app?.configurations?.ios?.lastSdkActivityAt));
  const hasAndroidConfig = (app) => !!(app?.configurations?.android?.packageName || getAndroidFingerPrints(app).length > 0);
  const hasIosConfig = (app) => !!(app?.configurations?.ios?.teamId || app?.configurations?.ios?.bundleId || app?.configurations?.ios?.storeId);

  // Main app status is pending if either domain or SDK (Android or iOS) is pending
  const isAppStatusPending = (app) => {
    const domainPending = app?.domainId && app.domainId.status !== 'verified';
    const sdkPending = !isAndroidSdkVerified(app) || !isIosSdkVerified(app);
    return domainPending || sdkPending;
  };

  const isBothSdkPending = (app) => !isAndroidSdkVerified(app) && !isIosSdkVerified(app);

  const handleRefreshSdkVerification = async (appId, e) => {
    e?.stopPropagation();
    setRefreshingSdkAppId(appId);
    try {
      const result = await getUserApps();
      if (result?.apps) setUserApps(result.apps);
    } catch (err) {
      setError(err?.message || 'Failed to refresh');
    } finally {
      setRefreshingSdkAppId(null);
    }
  };

  const openEditApp = (app, e) => {
    e?.stopPropagation();
    setEditingApp(app);
    const androidPrints = (app.configurations?.android?.fingerPrints || []).filter(Boolean);
    const hasAndroid = !!(app.configurations?.android?.packageName || androidPrints.length > 0);
    const hasIos = !!(app.configurations?.ios?.teamId || app.configurations?.ios?.bundleId || app.configurations?.ios?.storeId);
    setEditForm({
      name: app.name || '',
      fallbackUrl: app.fallbackUrl || '',
      hasAndroidApp: hasAndroid,
      hasIosApp: hasIos,
      hadAndroidConfig: hasAndroid, // cannot uncheck if already had config
      hadIosConfig: hasIos,
      android: {
        packageName: app.configurations?.android?.packageName || '',
        fingerPrints: androidPrints.length ? androidPrints : [''],
      },
      ios: {
        teamId: app.configurations?.ios?.teamId || '',
        bundleId: app.configurations?.ios?.bundleId || '',
        storeId: app.configurations?.ios?.storeId || '',
      },
    });
  };

  const closeEditApp = () => {
    setEditingApp(null);
    setError(null);
  };

  const handleSaveEditApp = async (e) => {
    e?.preventDefault();
    if (!editingApp) return;
    setIsSubmittingEdit(true);
    setError(null);
    try {
      await updateApp(editingApp._id, {
        name: editForm.name.trim(),
        fallbackUrl: editForm.fallbackUrl.trim(),
        configurations: {
          android: editForm.hasAndroidApp
            ? { packageName: editForm.android.packageName.trim() || null, fingerPrints: editForm.android.fingerPrints.map((fp) => fp.trim()).filter(Boolean) }
            : { packageName: null, fingerPrints: [] },
          ios: editForm.hasIosApp
            ? { teamId: editForm.ios.teamId.trim() || null, bundleId: editForm.ios.bundleId.trim() || null, storeId: editForm.ios.storeId.trim() || null }
            : { teamId: null, bundleId: null, storeId: null },
        },
      });
      const result = await getUserApps();
      if (result?.apps) setUserApps(result.apps);
      setSuccessMessage('App updated successfully.');
      closeEditApp();
    } catch (err) {
      setError(err?.message || 'Failed to update app');
    } finally {
      setIsSubmittingEdit(false);
    }
  };

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

        // Fetch overview stats (links count, clicks, installs) when app exists
        if (result.isAppExists) {
          try {
            const statsResult = await getOverviewStats();
            if (statsResult.success) {
              setStats({
                linksCount: statsResult.linksCount ?? 0,
                totalClicks: statsResult.totalClicks ?? 0,
                totalInstalls: statsResult.totalInstalls ?? 0,
              });
            }
          } catch (statsErr) {
            console.error('[Overview] Error fetching overview stats:', statsErr);
          }
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
        // App name: if provided, must be 3-15 chars (backend constraint)
        const nameToUse = appName.trim();
        if (nameToUse && (nameToUse.length < 3 || nameToUse.length > 15)) {
          setError('App name must be between 3 and 15 characters.');
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
            name: (appName.trim().length >= 3 && appName.trim().length <= 15)
              ? appName.trim().substring(0, 15)
              : subdomain.trim().substring(0, 15).replace(/\./g, '-') || 'my-app',
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
              fingerPrints: sha256Fingerprints.map((fp) => fp.trim()).filter(Boolean),
            };
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
        <main className="flex-1 overflow-y-auto bg-transparent">
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
                    className="px-6 py-3 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors"
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
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="text-gray-600 mt-4">Loading...</p>
            </div>
          </div>
        </main>
      </DashboardLayout>
    );
  }

  // Stat cards - Clicks, Link Created, Installs (matches dashboard pattern)
  const StatCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-6">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 flex items-center gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{formatCompact(stats.totalClicks)}</p>
          <p className="text-sm text-gray-600 mt-0.5">Clicks</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 flex items-center gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.linksCount}</p>
          <p className="text-sm text-gray-600 mt-0.5">Link Created</p>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 flex items-center gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12m0 0l4-4m-4 4l4-4" />
          </svg>
        </div>
        <div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{formatCompact(stats.totalInstalls)}</p>
          <p className="text-sm text-gray-600 mt-0.5">Installs</p>
        </div>
      </div>
    </div>
  );

  // Show app exists view if app already exists
  if (isAppExists) {
    return (
      <DashboardLayout title="Overview" subtitle="Home">
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <StatCards />
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
                      <div className="px-3 py-1 bg-gray-100 text-gray-900 text-xs font-medium rounded-full">
                        {userInfo.currentPlan}
                      </div>
                    )}
                    <button
                      onClick={() => setIsAppExists(false)}
                      className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors flex items-center gap-2"
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
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
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
                            ? 'border-gray-700 bg-gray-50/50 shadow-md' 
                            : 'border-gray-200 hover:border-gray-500 hover:bg-gray-50/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                              {app.name?.charAt(0)?.toUpperCase() || 'A'}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 group-hover:text-gray-900 transition-colors">
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
                            {/* App status: Pending if domain or SDK (Android/iOS) is pending */}
                            {isAppStatusPending(app) ? (
                              <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Pending
                              </span>
                            ) : app.domainId?.status === 'verified' ? (
                              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded flex items-center gap-1">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Verified
                              </span>
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
                                  ? 'bg-gray-200 text-gray-900' 
                                  : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'
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
                          <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50/50 -mx-4 -mb-4 px-4 pb-4 rounded-b-lg">
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                            {/* SDK setup status – Android & iOS (show both if user has either) */}
                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-gray-500">SDK setup</p>
                                {isBothSdkPending(app) && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleRefreshSdkVerification(app._id, e)}
                                    disabled={refreshingSdkAppId === app._id}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60 inline-flex items-center gap-1.5"
                                    title="Refetch to check if SDK setup is done (e.g. after running your app)"
                                  >
                                    {refreshingSdkAppId === app._id ? (
                                      <>
                                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        Checking…
                                      </>
                                    ) : (
                                      <>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                        Refresh verification
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                              <div className="space-y-2">
                                {hasAndroidConfig(app) && (
                                  <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                    <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                        <path d="M17.523 2.048a2.5 2.5 0 0 0-2.5 2.5v14.904a2.5 2.5 0 0 0 2.5 2.5h2.5a2.5 2.5 0 0 0 2.5-2.5V4.548a2.5 2.5 0 0 0-2.5-2.5h-2.5zm-11.046 0a2.5 2.5 0 0 0-2.5 2.5v14.904a2.5 2.5 0 0 0 2.5 2.5h2.5a2.5 2.5 0 0 0 2.5-2.5V4.548a2.5 2.5 0 0 0-2.5-2.5h-2.5z"/>
                                      </svg>
                                      Android
                                    </span>
                                    {isAndroidSdkVerified(app) ? (
                                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded inline-flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Verified
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-2">
                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded inline-flex items-center gap-1">
                                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          Pending
                                        </span>
                                        <a
                                          href={SDK_DOCS_URL}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-2 py-1 text-primary hover:underline text-xs font-medium rounded inline-flex items-center gap-1"
                                        >
                                          View docs
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                      </span>
                                    )}
                                  </div>
                                )}
                                {hasIosConfig(app) && (
                                  <div className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
                                    <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                                      </svg>
                                      iOS
                                    </span>
                                    {isIosSdkVerified(app) ? (
                                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded inline-flex items-center gap-1">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Verified
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-2">
                                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded inline-flex items-center gap-1">
                                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                          </svg>
                                          Pending
                                        </span>
                                        <a
                                          href={SDK_DOCS_URL}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="px-2 py-1 text-primary hover:underline text-xs font-medium rounded inline-flex items-center gap-1"
                                        >
                                          View docs
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full min-w-0">
                              <a
                                href={`https://${app.subDomain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-1 min-w-0 truncate"
                              >
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                <span className="truncate">Visit Domain</span>
                              </a>
                              <button
                                onClick={() => window.location.href = `/dashboard/links?app=${app._id}`}
                                className="px-2 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-black transition-colors inline-flex items-center justify-center gap-1 min-w-0 truncate"
                              >
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                <span className="truncate">Manage Links</span>
                              </button>
                              <button
                                onClick={() => window.location.href = `/dashboard/analytics?app=${app._id}`}
                                className="px-2 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-1 min-w-0 truncate"
                              >
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <span className="truncate">Analytics</span>
                              </button>
                              <button
                                onClick={() => window.location.href = `/dashboard/settings?app=${app._id}`}
                                className="px-2 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-1 min-w-0 truncate"
                              >
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="truncate">Settings</span>
                              </button>
                              <button
                                onClick={(e) => openEditApp(app, e)}
                                className="px-2 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-1 min-w-0 truncate"
                                title="Edit app configuration"
                              >
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828L18.172 5.172z" />
                                </svg>
                                <span className="truncate">Edit</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add New App Card */}
                    {/* <button
                      onClick={() => setIsAppExists(false)}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-gray-600 hover:bg-gray-50/50 transition-all cursor-pointer group w-full"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 group-hover:bg-gray-200 rounded-lg flex items-center justify-center transition-colors">
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                        <div className="text-left">
                          <h3 className="font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">
                            Add New App
                          </h3>
                          <p className="text-xs text-gray-400 group-hover:text-gray-900 transition-colors">
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
                      className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors inline-flex items-center gap-2"
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
                      className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2"
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
                    Easily create, customize, and manage links with our SDK. Follow simple steps to integrate Deeplink.insDK into your app.
                  </p>
                  <a
                    href="https://docs.deeplink.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-900 hover:text-black underline font-medium"
                  >
                    Go To Docs
                  </a>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Edit app modal */}
        {editingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={closeEditApp}>
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Edit app</h3>
                <p className="text-sm text-gray-500 mt-0.5">Update name, fallback URL, and SDK config. Subdomain cannot be changed.</p>
              </div>
              <form onSubmit={handleSaveEditApp} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">App name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="My App"
                    minLength={3}
                    maxLength={15}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Subdomain (read-only)</label>
                  <input type="text" value={editingApp.subDomain || ''} readOnly className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fallback URL</label>
                  <input
                    type="url"
                    value={editForm.fallbackUrl}
                    onChange={(e) => setEditForm((f) => ({ ...f, fallbackUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    placeholder="https://example.com"
                  />
                </div>
                <div className="pt-2 border-t border-gray-200 flex flex-wrap gap-6">
                  <label className={`inline-flex items-center gap-2 ${editForm.hadAndroidConfig ? 'cursor-default' : 'cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      checked={editForm.hasAndroidApp}
                      disabled={editForm.hadAndroidConfig}
                      onChange={(e) => !editForm.hadAndroidConfig && setEditForm((f) => ({ ...f, hasAndroidApp: e.target.checked }))}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm font-medium text-gray-700">I have an Android app</span>
                    {/* {editForm.hadAndroidConfig && <span className="text-xs text-gray-500">(already added)</span>} */}
                  </label>
                  <label className={`inline-flex items-center gap-2 ${editForm.hadIosConfig ? 'cursor-default' : 'cursor-pointer'}`}>
                    <input
                      type="checkbox"
                      checked={editForm.hasIosApp}
                      disabled={editForm.hadIosConfig}
                      onChange={(e) => !editForm.hadIosConfig && setEditForm((f) => ({ ...f, hasIosApp: e.target.checked }))}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm font-medium text-gray-700">I have an iOS app</span>
                    {/* {editForm.hadIosConfig && <span className="text-xs text-gray-500">(already added)</span>} */}
                  </label>
                </div>
                {editForm.hasAndroidApp && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Android</p>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editForm.android.packageName}
                        onChange={(e) => setEditForm((f) => ({ ...f, android: { ...f.android, packageName: e.target.value } }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        placeholder="Package name (e.g. com.example.app)"
                      />
                      <div>
                        <p className="text-xs text-gray-600 mb-1">SHA-256 certificate fingerprints</p>
                        {(editForm.android.fingerPrints || ['']).map((fp, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <input
                              type="text"
                              value={fp}
                              onChange={(e) => {
                                const next = [...(editForm.android.fingerPrints || [''])];
                                next[idx] = e.target.value;
                                setEditForm((f) => ({ ...f, android: { ...f.android, fingerPrints: next } }));
                              }}
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                              placeholder="e.g. AB:CD:EF:12:34:..."
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const next = (editForm.android.fingerPrints || ['']).filter((_, i) => i !== idx);
                                setEditForm((f) => ({ ...f, android: { ...f.android, fingerPrints: next.length ? next : [''] } }));
                              }}
                              className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                              aria-label="Remove fingerprint"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setEditForm((f) => ({ ...f, android: { ...f.android, fingerPrints: [...(f.android.fingerPrints || ['']), ''] } }))}
                          className="text-sm text-primary hover:underline"
                        >
                          + Add another fingerprint
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {editForm.hasIosApp && (
                  <div className="pt-2 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">iOS</p>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={editForm.ios.teamId}
                        onChange={(e) => setEditForm((f) => ({ ...f, ios: { ...f.ios, teamId: e.target.value } }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        placeholder="Team ID"
                      />
                      <input
                        type="text"
                        value={editForm.ios.bundleId}
                        onChange={(e) => setEditForm((f) => ({ ...f, ios: { ...f.ios, bundleId: e.target.value } }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        placeholder="Bundle ID"
                      />
                      <input
                        type="text"
                        value={editForm.ios.storeId}
                        onChange={(e) => setEditForm((f) => ({ ...f, ios: { ...f.ios, storeId: e.target.value } }))}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                        placeholder="App Store ID (optional)"
                      />
                    </div>
                  </div>
                )}
                <div className="flex gap-2 pt-4">
                  <button type="button" onClick={closeEditApp} className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmittingEdit || !editForm.name.trim() || !editForm.fallbackUrl.trim()} className="flex-1 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-black disabled:opacity-50">
                    {isSubmittingEdit ? 'Saving…' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Overview" subtitle="Home">
      <main className="flex-1 overflow-y-auto bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <StatCards />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Getting Started Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 lg:col-span-2">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    {userApps.length > 0 ? 'Add New App' : 'Getting Started with Deeplink.in!'}
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
                          ? 'bg-gray-900 text-white' 
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
                        App name
                      </h3>
                      <p className="text-xs text-gray-600 mb-3">
                        A display name for your app (3–15 characters). 
                      </p>
                      <input
                        type="text"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value.replace(/[^a-zA-Z0-9-_ ]/g, '').substring(0, 15))}
                        disabled={!isStepActive(1)}
                        className="w-full max-w-xs px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="e.g. My App"
                        maxLength={15}
                      />
                      {appName.length > 0 && appName.length < 3 && (
                        <p className="text-xs text-amber-600 mt-1">Min 3 characters</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3 mb-3 mt-6">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-transparent" aria-hidden />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-900 mb-1">
                        Choose your domain:
                      </h3>
                      <p className="text-xs text-gray-600 mb-3">
                        Pick a subdomain or use your custom domain if you have one verified.
                      </p>

                      {/* Domain Type Toggle */}
                      <div className="flex gap-2 mb-3">
                        {/* <button
                          onClick={() => {
                            setDomainType('subdomain');
                            setShowAddDomainForm(false);
                          }}
                          disabled={!isStepActive(1)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            domainType === 'subdomain'
                              ? 'bg-gray-900 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          Subdomain (.chottu.link)
                        </button> */}
                        <button
                          onClick={() => setDomainType('custom')}
                          disabled={!isStepActive(1)}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                            domainType === 'custom'
                              ? 'bg-gray-900 text-white'
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
                              className="w-full pl-[72px] pr-[100px] py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                              placeholder="select-subdomain"
                            />
                            <span className="absolute right-3 text-sm text-gray-500 pointer-events-none">
                              .chottu.link
                            </span>
                          </div>
                          <button
                            onClick={() => handleStepContinue(1, subdomain)}
                            disabled={!subdomain || subdomain.trim() === '' || !isStepActive(1)}
                            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                                  className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap disabled:bg-gray-300 disabled:cursor-not-allowed"
                              >
                                Continue
                              </button>
                            </div>
                          )}

                          {/* DNS Setup Instructions for pending domains */}
                          {selectedCustomDomain && selectedCustomDomain.status !== 'verified' && !showAddDomainForm && (
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                              <p className="text-xs text-gray-900 mb-2 font-semibold">
                                📋 DNS Configuration Required
                              </p>
                              <div className="text-xs text-gray-700 mb-3">
                                <p className="mb-2">Add this CNAME record to your DNS provider:</p>
                                <div className="bg-white p-2 rounded border border-gray-200 font-mono text-xs">
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
                                  className="mt-0.5 w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                                />
                                <span className="text-xs text-gray-900">
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
                              className="text-xs text-gray-900 hover:text-black font-medium flex items-center gap-1"
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
                                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                                    className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
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
                                  className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                          ? 'bg-gray-900 text-white' 
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
                          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                          placeholder="https://example.com/fallback"
                        />
                        <button
                          onClick={() => handleStepContinue(2, fallbackUrl)}
                          disabled={!fallbackUrl || fallbackUrl.trim() === '' || !isStepActive(2)}
                          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                          ? 'bg-gray-900 text-white' 
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
                            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
                              />
                              <span className="text-sm text-gray-700">Enable App Links</span>
                            </label>
                          </div>

                          {/* SHA256 Fingerprints */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              SHA256 certificate fingerprints
                            </label>
                            {(sha256Fingerprints || ['']).map((fp, idx) => (
                              <div key={idx} className="flex gap-2 mb-2">
                                <input
                                  type="text"
                                  value={fp}
                                  onChange={(e) => {
                                    const next = [...(sha256Fingerprints || [''])];
                                    next[idx] = e.target.value;
                                    setSha256Fingerprints(next);
                                  }}
                                  disabled={!isStepActive(3)}
                                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                  placeholder="e.g. AB:CD:EF:12:34:56:78:90:..."
                                />
                                <button
                                  type="button"
                                  onClick={() => setSha256Fingerprints((prev) => prev.filter((_, i) => i !== idx).length ? prev.filter((_, i) => i !== idx) : [''])}
                                  disabled={!isStepActive(3)}
                                  className="px-2 py-1 text-red-600 hover:bg-red-50 rounded text-sm disabled:opacity-50"
                                  aria-label="Remove fingerprint"
                                >
                                  Remove
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => setSha256Fingerprints((prev) => [...(prev || ['']), ''])}
                              disabled={!isStepActive(3)}
                              className="text-sm text-primary hover:underline disabled:opacity-50"
                            >
                              + Add another fingerprint
                            </button>
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
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                          ? 'bg-gray-900 text-white' 
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
                            className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                                className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
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
                          className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-900 transition-colors whitespace-nowrap disabled:bg-gray-300 disabled:cursor-not-allowed"
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
                Easily create, customize, and manage links with our SDK. Follow simple steps to integrate Deeplink.insDK into your app.
              </p>
              <a
                href="https://docs.deeplink.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-900 hover:text-black underline font-medium"
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

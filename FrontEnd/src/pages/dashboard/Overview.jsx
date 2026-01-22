import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { createAppWithConfigurations } from '../../services/appService';
import { getCurrentUser } from '../../services/authService';

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

  // Check if app exists on component mount
  useEffect(() => {
    const checkAppExists = async () => {
      try {
        const result = await getCurrentUser();
        if (result.success) {
          setIsAppExists(result.isAppExists || false);
          setUserInfo({
            userType: result.userType,
            currentPlan: result.currentPlan,
          });
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

    checkAppExists();
  }, []);

  const handleStepContinue = async (stepNumber, value) => {
    if (value && value.trim() !== '') {
      setError(null);
      setSuccessMessage(null);

      // Handle final submission (Step 4) - Submit all configurations in one request
      if (stepNumber === 4) {
        // Validate required fields only on final submission
        if (!subdomain || subdomain.trim().length < 3 || subdomain.trim().length > 15) {
          setError('Please complete step 1 (subdomain) first. Subdomain must be 3-15 characters.');
          return;
        }

        if (!fallbackUrl || fallbackUrl.trim() === '') {
          setError('Please complete step 2 (fallback URL) first.');
          return;
        }
        setIsSubmitting(true);
        
        try {
          // Build the app configuration payload
          const appConfig = {
            name: subdomain.trim().substring(0, 15),
            subDomain: `${subdomain.trim()}.chottu.link`, // Format: subdomain.chottu.link
            fallbackUrl: fallbackUrl.trim(),
            android: null,
            ios: null,
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
              {/* App Already Configured Card */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8 lg:col-span-2">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      App Configuration Complete
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">
                      Your app has been successfully configured. You can now start creating and managing your deep links.
                    </p>
                    {userInfo && (
                      <div className="flex flex-wrap gap-4 mb-4">
                        {userInfo.currentPlan && (
                          <div className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            Plan: {userInfo.currentPlan}
                          </div>
                        )}
                        {userInfo.userType && (
                          <div className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                            Type: {userInfo.userType}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => window.location.href = '/dashboard/links'}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Create Your First Link
                      </button>
                      <button
                        onClick={() => window.location.href = '/dashboard/analytics'}
                        className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        View Analytics
                      </button>
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
  }

  return (
    <DashboardLayout title="Overview" subtitle="Home">
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Getting Started Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 lg:col-span-2">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Getting Started with ChottuLink!
              </h2>
              <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                Fill the form to get full access to your workspace
              </p>

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
                        Choose your subdomain:
                      </h3>
                      <p className="text-xs text-gray-600 mb-3">
                        Pick a subdomain that represents your organization, brand, or workspace.
                      </p>
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

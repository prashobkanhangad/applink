import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createLink, getLinks } from '../../services/appService';

/**
 * Links Page - Create and Manage Links
 */
export const Links = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isCreateMode = searchParams.get('action') === 'create';
  
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [domain, setDomain] = useState('earlyjobs.chottu.link');
  const [path, setPath] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [destinationUrl, setDestinationUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [appleBehavior, setAppleBehavior] = useState('Open the Dynamic URL in a browser');
  const [androidBehavior, setAndroidBehavior] = useState('Open the Dynamic URL in a browser');
  const [selectedSocialPreview, setSelectedSocialPreview] = useState('web');
  const [enableSocialMetaTags, setEnableSocialMetaTags] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState('');
  const [previewDescription, setPreviewDescription] = useState('');
  const [enableUTMTracking, setEnableUTMTracking] = useState(false);
  const [utmSource, setUtmSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');
  const [utmTerm, setUtmTerm] = useState('');
  const [utmContent, setUtmContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch links on component mount (only if not in create mode)
  useEffect(() => {
    if (!isCreateMode) {
      loadLinks();
    } else {
      setIsLoading(false);
    }
  }, [isCreateMode]);

  const loadLinks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getLinks();
      if (result.success) {
        setLinks(Array.isArray(result.links) ? result.links : []);
      }
    } catch (err) {
      console.error('Error loading links:', err);
      setError(err.message || 'Failed to load links');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClick = () => {
    setSearchParams({ action: 'create' });
  };

  const handleCancelCreate = () => {
    setSearchParams({});
    loadLinks();
  };

  const handleNext = () => {
    if (currentStep === 1 && path.trim() !== '') {
      setCurrentStep(2);
    } else if (currentStep === 2 && destinationUrl.trim() !== '') {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      setCurrentStep(5);
    }
  };

  const handleCreate = async () => {
    // Validate required fields
    if (!path || path.trim() === '') {
      setError('Please enter a path for your link.');
      return;
    }

    if (!destinationUrl || destinationUrl.trim() === '') {
      setError('Please enter a destination URL.');
      return;
    }

    if (!linkName || linkName.trim().length < 3 || linkName.trim().length > 30) {
      setError('Link name must be between 3 and 30 characters.');
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Map behavior values to API format
      const mapBehaviorToApi = (behavior) => {
        if (behavior.includes('browser')) {
          return 'open_url';
        } else if (behavior.includes('App')) {
          return 'open_app';
        }
        return 'open_url'; // Default
      };

      // Build UTM object if social tags or UTM tracking is enabled
      const utmObject = {};
      if (enableSocialMetaTags) {
        if (previewTitle.trim()) utmObject.previewTitle = previewTitle.trim();
        if (previewDescription.trim()) utmObject.previewDescription = previewDescription.trim();
        if (previewImageUrl.trim()) utmObject.previewImageUrl = previewImageUrl.trim();
      }
      if (enableUTMTracking) {
        if (utmSource.trim()) utmObject.campaignSource = utmSource.trim();
        if (utmMedium.trim()) utmObject.campaignMedium = utmMedium.trim();
        if (utmCampaign.trim()) utmObject.campaignName = utmCampaign.trim();
        if (utmTerm.trim()) utmObject.campaignTerm = utmTerm.trim();
        if (utmContent.trim()) utmObject.campaignContent = utmContent.trim();
      }

      // Ensure domain is a full URI (add https:// if missing)
      let domainUri = domain.trim();
      if (!domainUri.startsWith('http://') && !domainUri.startsWith('https://')) {
        domainUri = `https://${domainUri}`;
      }

      // Build link payload
      const linkPayload = {
        domain: domainUri,
        path: path.trim(),
        destinationUrl: destinationUrl.trim(),
        linkName: linkName.trim(),
        androidBehavior: mapBehaviorToApi(androidBehavior),
        iosBehavior: mapBehaviorToApi(appleBehavior),
      };

      // Add UTM object only if it has at least one property
      if (Object.keys(utmObject).length > 0) {
        linkPayload.utm = utmObject;
      }

      const result = await createLink(linkPayload);
      
      if (result.success) {
        setSuccessMessage(result.message || 'Link created successfully!');
        // Reset form and navigate back to list view after successful creation
        setTimeout(() => {
          setPath('');
          setDestinationUrl('');
          setLinkName('');
          setCurrentStep(1);
          setAppleBehavior('Open the Dynamic URL in a browser');
          setAndroidBehavior('Open the Dynamic URL in a browser');
          setEnableSocialMetaTags(false);
          setPreviewTitle('');
          setPreviewImageUrl('');
          setPreviewDescription('');
          setEnableUTMTracking(false);
          setUtmSource('');
          setUtmMedium('');
          setUtmCampaign('');
          setUtmTerm('');
          setUtmContent('');
          setSuccessMessage(null);
          setSearchParams({});
          loadLinks();
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to create link. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  // Show create form if in create mode
  if (isCreateMode) {
    return (
      <DashboardLayout title="Links Manager" subtitle="Create Link">
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={handleCancelCreate}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Links
              </button>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Set up your Short Link Or Dynamic URL */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    1
                  </span>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      Set up your Short Link Or Dynamic URL
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-4">
                      Customise your Short Link Or Dynamic URL to make it more professional and contextual.
                    </p>
                    
                    {/* Domain Field */}
                    <div className="mb-4">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Domain
                      </label>
                      <input
                        type="text"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
                        readOnly
                      />
                    </div>

                    {/* Path Field */}
                    <div className="mb-4">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                        Path <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={path}
                        onChange={(e) => setPath(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="/ e.g. home"
                      />
                    </div>

                    {/* Next Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleNext}
                        disabled={!path || path.trim() === ''}
                        className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2: Set up your dynamic link */}
              {currentStep >= 2 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      2
                    </span>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                        Set up your dynamic link
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-4">
                        A dynamic link is a deep link into your app that works whether or not your app is installed. On desktop it will go to the deep link url.
                      </p>
                      
                      {/* Destination URL Field */}
                      <div className="mb-4">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Destination URL
                        </label>
                        <input
                          type="url"
                          value={destinationUrl}
                          onChange={(e) => setDestinationUrl(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="E.g.: https://yourapp.com/welcome-page"
                        />
                      </div>

                      {/* Link Name Field */}
                      <div className="mb-4">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Link Name
                        </label>
                        <input
                          type="text"
                          value={linkName}
                          onChange={(e) => setLinkName(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="e.g. Seasonal Promo"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Pick a name that helps you recognize the link easily
                        </p>
                      </div>

                      {/* Next Button */}
                      <div className="flex justify-end">
                        <button
                          onClick={handleNext}
                          disabled={!destinationUrl || destinationUrl.trim() === ''}
                          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Define link behaviour for Apple */}
              {currentStep >= 3 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      3
                    </span>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                        Define link behaviour for Apple
                      </h3>
                      
                      {/* Radio Options */}
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="appleBehavior"
                            value="Open the Dynamic URL in a browser"
                            checked={appleBehavior === 'Open the Dynamic URL in a browser'}
                            onChange={(e) => setAppleBehavior(e.target.value)}
                            className="mt-1 w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">
                              Open the Dynamic URL in a browser
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="appleBehavior"
                            value="Open the Dynamic URL in your Apple App"
                            checked={appleBehavior === 'Open the Dynamic URL in your Apple App'}
                            onChange={(e) => setAppleBehavior(e.target.value)}
                            className="mt-1 w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">
                              Open the Dynamic URL in your Apple App
                            </span>
                          </div>
                        </label>
                      </div>

                      {/* Next Button */}
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={handleNext}
                          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Define link behaviour for Android */}
              {currentStep >= 4 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      4
                    </span>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                        Define link behaviour for Android
                      </h3>
                      
                      {/* Radio Options */}
                      <div className="space-y-3">
                        <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="androidBehavior"
                            value="Open the Dynamic URL in a browser"
                            checked={androidBehavior === 'Open the Dynamic URL in a browser'}
                            onChange={(e) => setAndroidBehavior(e.target.value)}
                            className="mt-1 w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">
                              Open the Dynamic URL in a browser
                            </span>
                          </div>
                        </label>

                        <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                          <input
                            type="radio"
                            name="androidBehavior"
                            value="Open the Dynamic URL in your Android App"
                            checked={androidBehavior === 'Open the Dynamic URL in your Android App'}
                            onChange={(e) => setAndroidBehavior(e.target.value)}
                            className="mt-1 w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">
                              Open the Dynamic URL in your Android App
                            </span>
                          </div>
                        </label>
                      </div>

                      {/* Next Button */}
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={handleNext}
                          className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Campaign tracking, social tags and advanced options */}
              {currentStep >= 5 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <span className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      5
                    </span>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                        Campaign tracking, social tags and advanced options (optional)
                      </h3>
                      
                      {/* Add social meta tags */}
                      <div className="mb-6">
                        <label className="flex items-center gap-2 mb-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enableSocialMetaTags}
                            onChange={(e) => setEnableSocialMetaTags(e.target.checked)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm font-medium text-gray-900">
                            Add social meta tags for better sharing
                          </span>
                        </label>

                        {enableSocialMetaTags && (
                          <div className="ml-6 space-y-4">
                            {/* Preview Title */}
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                Preview title (st)
                              </label>
                              <input
                                type="text"
                                value={previewTitle}
                                onChange={(e) => setPreviewTitle(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="E.g.: Seasonal Promo"
                              />
                            </div>

                            {/* Preview Image URL */}
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                Preview image URL (si)
                              </label>
                              <input
                                type="url"
                                value={previewImageUrl}
                                onChange={(e) => setPreviewImageUrl(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="E.g.: https://mydomain.com/images/promo.jpg"
                              />
                            </div>

                            {/* Preview Description */}
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                Preview description (sd)
                              </label>
                              <textarea
                                value={previewDescription}
                                onChange={(e) => setPreviewDescription(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="e.g. Some description..."
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Track a campaign with UTM parameters */}
                      <div>
                        <label className="flex items-center gap-2 mb-4 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={enableUTMTracking}
                            onChange={(e) => setEnableUTMTracking(e.target.checked)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm font-medium text-gray-900">
                            Track a campaign with UTM parameters
                          </span>
                        </label>

                        {enableUTMTracking && (
                          <div className="ml-6 space-y-4">
                            {/* Campaign Source */}
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                Campaign Source (utm_source)
                              </label>
                              <input
                                type="text"
                                value={utmSource}
                                onChange={(e) => setUtmSource(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="e.g. ChottuLink"
                              />
                            </div>

                            {/* Campaign Medium */}
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                Campaign medium (utm_medium)
                              </label>
                              <input
                                type="text"
                                value={utmMedium}
                                onChange={(e) => setUtmMedium(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="e.g. cpc"
                              />
                            </div>

                            {/* Campaign Name */}
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                Campaign name (utm_campaign)
                              </label>
                              <input
                                type="text"
                                value={utmCampaign}
                                onChange={(e) => setUtmCampaign(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="e.g. spring sale"
                              />
                            </div>

                            {/* Term Name */}
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                Term name (utm_term)
                              </label>
                              <input
                                type="text"
                                value={utmTerm}
                                onChange={(e) => setUtmTerm(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="e.g. email+spring+offer"
                              />
                            </div>

                            {/* UTM Content */}
                            <div>
                              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                UTM Content (utm_content)
                              </label>
                              <input
                                type="text"
                                value={utmContent}
                                onChange={(e) => setUtmContent(e.target.value)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                placeholder="e.g. image_top_banner"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Dynamic Link Configuration Steps */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                <div className="space-y-4">
                  {/* Set up your dynamic link - Summary */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {currentStep >= 2 ? (
                        <CheckIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <WarningIcon className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        Set up your dynamic link
                      </h4>
                      {currentStep >= 2 && destinationUrl && (
                        <p className="text-xs text-gray-600">{destinationUrl}</p>
                      )}
                    </div>
                  </div>

                  {/* Define link behaviour for Apple - Summary */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {currentStep >= 3 ? (
                        <CheckIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <EditIcon className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        Define link behaviour for Apple
                      </h4>
                      {currentStep >= 3 && (
                        <p className="text-xs text-gray-600">{appleBehavior}</p>
                      )}
                    </div>
                  </div>

                  {/* Define link behaviour for Android - Summary */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {currentStep >= 4 ? (
                        <CheckIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <EditIcon className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        Define link behaviour for Android
                      </h4>
                      {currentStep >= 4 && (
                        <p className="text-xs text-gray-600">{androidBehavior}</p>
                      )}
                    </div>
                  </div>

                  {/* Campaign tracking - Summary */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {currentStep >= 5 ? (
                        <CheckIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <EditIcon className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">
                        Campaign tracking, social tags and advanced options (optional)
                      </h4>
                      {currentStep >= 5 && (enableSocialMetaTags || enableUTMTracking) && (
                        <p className="text-xs text-gray-600">
                          {enableSocialMetaTags && enableUTMTracking 
                            ? 'Social tags & UTM tracking enabled'
                            : enableSocialMetaTags 
                            ? 'Social tags enabled'
                            : 'UTM tracking enabled'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleCreate}
                  disabled={isCreating || !path || !destinationUrl || !linkName || linkName.trim().length < 3 || linkName.trim().length > 30}
                  className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>

            {/* Right Column - Sidebars */}
            <div className="space-y-6">
              {/* QR Code Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">QR Code</h3>
                  <QuestionMarkIcon className="w-4 h-4 text-gray-400" />
                </div>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px]">
                  <QRCodeIcon className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-xs sm:text-sm text-gray-500 text-center">
                    Enter a path to generate QR code
                  </p>
                </div>
              </div>

              {/* Social Link Preview Section */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Social Link Preview</h3>
                  <QuestionMarkIcon className="w-4 h-4 text-gray-400" />
                </div>
                
                {/* Social Media Icons */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setSelectedSocialPreview('web')}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedSocialPreview === 'web'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <GlobeIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedSocialPreview('twitter')}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedSocialPreview === 'twitter'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <TwitterIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedSocialPreview('linkedin')}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedSocialPreview === 'linkedin'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <LinkedInIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedSocialPreview('facebook')}
                    className={`p-2 rounded-lg transition-colors ${
                      selectedSocialPreview === 'facebook'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                  >
                    <FacebookIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Preview Box */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center min-h-[200px] mb-4">
                  <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                  <p className="text-xs sm:text-sm text-gray-500 text-center">
                    Enter a link to generate a preview
                  </p>
                </div>

                {/* Preview Labels */}
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500">Preview Title</label>
                    <p className="text-sm text-gray-900 mt-1">-</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Preview Description</label>
                    <p className="text-sm text-gray-900 mt-1">-</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </DashboardLayout>
    );
  }

  // Show links list view
  return (
    <DashboardLayout title="Links Manager" subtitle="Link List">
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Header with Create Button */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Your Links</h2>
              <p className="text-sm text-gray-600 mt-1">Manage and track all your deep links</p>
            </div>
            <button
              onClick={handleCreateClick}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Link
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={loadLinks}
                className="mt-2 text-sm text-red-600 hover:text-red-700 underline"
              >
                Retry
              </button>
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Loading links...</p>
              </div>
            </div>
          ) : links.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Links Yet</h3>
                <p className="text-sm text-gray-600 mb-6">
                  Create your first deep link to get started with tracking and analytics.
                </p>
                <button
                  onClick={handleCreateClick}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Link
                </button>
              </div>
            </div>
          ) : (
            /* Links Table */
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Link Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Short Link
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Destination URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Clicks
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {links.map((link, index) => (
                      <tr 
                        key={link._id || link.id || index} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => navigate(`/dashboard/links/${link._id || link.id || index}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{link.linkName || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {link.domain && link.path ? `${link.domain}${link.path}` : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 truncate max-w-xs">
                            {link.destinationUrl || '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{link.clicks || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {link.createdAt
                              ? new Date(link.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })
                              : '-'}
                          </div>
                        </td>
                        <td 
                          className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => navigate(`/dashboard/links/${link._id || link.id || index}`)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            View
                          </button>
                          <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                          <button className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
};

// Icon Components
const WarningIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const CheckIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
  </svg>
);

const EditIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const QuestionMarkIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const QRCodeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
);

const ImageIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const GlobeIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const TwitterIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const FacebookIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export default Links;

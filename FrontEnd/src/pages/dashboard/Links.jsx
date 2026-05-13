import React, { useState, useEffect } from 'react';
import { Copy, Pencil, Trash2, Loader2 } from 'lucide-react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Button } from '../../components/ui/button';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createLink, getLinks, getUserApps, deleteLink, getLinkDetails, updateLink } from '../../services/appService';

/**
 * Links Page - Create and Manage Links
 */
export const Links = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isCreateMode = searchParams.get('action') === 'create';
  const editId = searchParams.get('id') || '';
  const isEditMode = searchParams.get('action') === 'edit' && editId;
  
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedLinkId, setCopiedLinkId] = useState(null);
  
  const [apps, setApps] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [domain, setDomain] = useState('');
  const [path, setPath] = useState('/');
  const [currentStep, setCurrentStep] = useState(1);
  const [destinationUrl, setDestinationUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [appleBehavior, setAppleBehavior] = useState('Open the Dynamic URL in a browser');
  const [androidBehavior, setAndroidBehavior] = useState('Open the Dynamic URL in a browser');
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
  const [deletingId, setDeletingId] = useState(null);
  const [linkToDelete, setLinkToDelete] = useState(null);
  const [isEditLoading, setIsEditLoading] = useState(false);

  // Fetch apps on component mount
  useEffect(() => {
    const loadApps = async () => {
      try {
        const result = await getUserApps();
        if (result.success) {
          setApps(Array.isArray(result.apps) ? result.apps : []);
          // Set default app if available
          if (result.apps && result.apps.length > 0) {
            const defaultApp = result.apps[0];
            setSelectedAppId(defaultApp._id || defaultApp.id);
            // Format domain: add https:// if subDomain doesn't start with http
            const subDomain = defaultApp.subDomain || '';
            const formattedDomain = subDomain.startsWith('http://') || subDomain.startsWith('https://') 
              ? subDomain 
              : `https://${subDomain}`;
            setDomain(formattedDomain);
          }
        }
      } catch (err) {
        console.error('Error loading apps:', err);
      }
    };
    loadApps();
  }, []);

  // Fetch links when showing list (not in create or edit form)
  useEffect(() => {
    if (!isCreateMode && !isEditMode) {
      loadLinks();
    } else if (isCreateMode) {
      setIsLoading(false);
    }
  }, [isCreateMode, isEditMode]);

  // Fetch link details when in edit mode
  useEffect(() => {
    if (!isEditMode || !editId || apps.length === 0) return;
    let cancelled = false;
    const loadLinkForEdit = async () => {
      setIsEditLoading(true);
      setError(null);
      try {
        const result = await getLinkDetails(editId);
        if (!result.success || !result.link || cancelled) return;
        const link = result.link;
        const app = link.appId;
        const subDomain = app?.subDomain || '';
        const formattedDomain = subDomain.startsWith('http://') || subDomain.startsWith('https://')
          ? subDomain
          : subDomain ? `https://${subDomain}` : '';
        setSelectedAppId(app?._id || '');
        setDomain(formattedDomain);
        setPath(link.path || '/');
        setDestinationUrl(link.destinationUrl || '');
        setLinkName(link.linkName || '');
        setAppleBehavior(link.iosBehavior === 'open_app' ? 'Open the App' : 'Open the Dynamic URL in a browser');
        setAndroidBehavior(link.androidBehavior === 'open_app' ? 'Open the App' : 'Open the Dynamic URL in a browser');
        const u = link.utm || {};
        setPreviewTitle(u.previewTitle || '');
        setPreviewDescription(u.previewDescription || '');
        setPreviewImageUrl(u.previewImageUrl || '');
        setUtmSource(u.campaignSource || '');
        setUtmMedium(u.campaignMedium || '');
        setUtmCampaign(u.campaignName || '');
        setUtmTerm(u.campaignTerm || '');
        setUtmContent(u.campaignContent || '');
        setEnableSocialMetaTags(!!(u.previewTitle || u.previewDescription || u.previewImageUrl));
        setEnableUTMTracking(!!(u.campaignSource || u.campaignMedium || u.campaignName || u.campaignTerm || u.campaignContent));
        // When editing an existing link, jump directly to Step 2 (dynamic link setup)
        setCurrentStep(2);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load link');
      } finally {
        if (!cancelled) setIsEditLoading(false);
      }
    };
    loadLinkForEdit();
    return () => { cancelled = true; };
  }, [isEditMode, editId, apps.length]);

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
    // Reset form so create doesn't show previous edit data
    setPath('/');
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
    setError(null);
    setSuccessMessage(null);
    if (apps.length > 0) {
      const defaultApp = apps[0];
      setSelectedAppId(defaultApp._id || defaultApp.id);
      const subDomain = defaultApp.subDomain || '';
      setDomain(subDomain.startsWith('http://') || subDomain.startsWith('https://') ? subDomain : subDomain ? `https://${subDomain}` : '');
    }
    setSearchParams({ action: 'create' });
  };

  const handleCancelCreate = () => {
    setSearchParams({});
    loadLinks();
  };

  const handleEditClick = (link, e) => {
    e?.stopPropagation();
    const id = link._id || link.id;
    if (id) setSearchParams({ action: 'edit', id });
  };

  const handleDeleteClick = (link, e) => {
    e.stopPropagation();
    setLinkToDelete(link);
    setError(null);
  };

  const handleDeleteConfirm = async () => {
    if (!linkToDelete) return;
    const id = linkToDelete._id || linkToDelete.id;
    if (!id) return;
    setDeletingId(id);
    try {
      await deleteLink(id);
      setLinks((prev) => prev.filter((l) => (l._id || l.id) !== id));
      setLinkToDelete(null);
    } catch (err) {
      setError(err.message || 'Failed to delete link');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setLinkToDelete(null);
  };

  const handleNext = () => {
    if (currentStep === 1) {
      const trimmedPath = (path || '').trim();
      if (!trimmedPath) {
        setError('Please enter a path for your link.');
        return;
      }

      // Check duplicate path for this app before going to next step
      const duplicateInState = links.find(
        (l) =>
          (l.appId?._id || l.appId || '') === selectedAppId &&
          (l.path || '') === trimmedPath
      );
      if (duplicateInState) {
        setError('A link with this path already exists for this app. Please choose a different path.');
        return;
      }

      setError(null);
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

    // Prevent creating duplicate path for the same app in the current list (best-effort UX; backend enforces too)
    const normalizedNewPath = (path || '').trim();
    const duplicateInState = links.find(
      (l) =>
        (l.appId?._id || l.appId || '') === selectedAppId &&
        (l.path || '') === normalizedNewPath
    );
    if (duplicateInState) {
      setError('A link with this path already exists for this app. Please choose a different path.');
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Build UTM object if social tags or UTM tracking is enabled
      const utmObject = {};
      if (enableSocialMetaTags) {
        if (previewTitle.trim()) utmObject.previewTitle = previewTitle.trim();
        if (previewDescription.trim()) utmObject.previewDescription = previewDescription.trim();
        if (previewImageUrl.trim()) {
          let imgUrl = previewImageUrl.trim();
          if (!imgUrl.startsWith('http://') && !imgUrl.startsWith('https://')) imgUrl = `https://${imgUrl}`;
          utmObject.previewImageUrl = imgUrl;
        }
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
          setPath('/');
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
      // Surface specific duplicate-path error from backend if present
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to create link. Please try again.';
      if (msg.toLowerCase().includes('already exists')) {
        setError('A link with this path already exists for this app. Please choose a different path.');
      } else {
        setError(msg);
      }
    } finally {
      setIsCreating(false);
    }
  };

  const mapBehaviorToApi = (behavior) => {
    if (behavior && behavior.includes('browser')) return 'open_url';
    if (behavior && behavior.includes('App')) return 'open_app';
    return 'open_url';
  };

  const handleUpdate = async () => {
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
      // Build full utm object so clearing fields on edit persists (backend sets null for empty)
      let imgUrl = previewImageUrl.trim();
      if (imgUrl && !imgUrl.startsWith('http://') && !imgUrl.startsWith('https://')) imgUrl = `https://${imgUrl}`;
      const utmObject = {
        previewTitle: enableSocialMetaTags ? previewTitle.trim() : '',
        previewDescription: enableSocialMetaTags ? previewDescription.trim() : '',
        previewImageUrl: enableSocialMetaTags && imgUrl ? imgUrl : '',
        campaignSource: enableUTMTracking ? utmSource.trim() : '',
        campaignMedium: enableUTMTracking ? utmMedium.trim() : '',
        campaignName: enableUTMTracking ? utmCampaign.trim() : '',
        campaignTerm: enableUTMTracking ? utmTerm.trim() : '',
        campaignContent: enableUTMTracking ? utmContent.trim() : '',
      };
      const payload = {
        path: path.trim(),
        destinationUrl: destinationUrl.trim(),
        linkName: linkName.trim(),
        androidBehavior: mapBehaviorToApi(androidBehavior),
        iosBehavior: mapBehaviorToApi(appleBehavior),
        utm: utmObject,
      };
      const result = await updateLink(editId, payload);
      if (result.success) {
        setSuccessMessage(result.message || 'Link updated successfully.');
        setTimeout(() => {
          setSuccessMessage(null);
          setSearchParams({});
          loadLinks();
        }, 2000);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to update link. Please try again.';
      if (msg.toLowerCase().includes('already exists')) {
        setError('A link with this path already exists for this app. Please choose a different path.');
      } else {
        setError(msg);
      }
    } finally {
      setIsCreating(false);
    }
  };

  // Show create/edit form when in create or edit mode
  if (isCreateMode || isEditMode) {
    return (
      <DashboardLayout title="Links Manager" subtitle={isEditMode ? 'Edit Link' : 'Create Link'}>
        <main className="flex-1 overflow-y-auto bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="mb-6">
              <Button variant="ghost" size="sm" className="-ml-2 text-gray-500 hover:text-gray-900" onClick={handleCancelCreate}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Links
              </Button>
            </div>

            {isEditMode && isEditLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
                <span className="ml-3 text-gray-500">Loading link...</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm">
                {successMessage}
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {!isEditLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className={`bg-white rounded-2xl border shadow-sm transition-all duration-300 ${currentStep === 1 ? 'border-primary/40 ring-2 ring-primary/10' : 'border-gray-200'}`}>
                <div 
                  className={`flex items-center gap-3 p-4 sm:p-6 ${currentStep !== 1 && currentStep > 1 ? 'cursor-pointer hover:bg-gray-100 rounded-t-2xl' : ''}`}
                  onClick={() => currentStep > 1 && setCurrentStep(1)}
                >
                  <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep > 1 ? 'bg-primary text-white' : 'bg-gray-900 text-white'}`}>
                    {currentStep > 1 ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : '1'}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Set up your Short Link Or Dynamic URL
                    </h3>
                    {currentStep > 1 && (
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 font-mono">
                        {domain}{path.startsWith('/') ? path : `/${path}`}
                      </p>
                    )}
                  </div>
                  {currentStep > 1 && (
                    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  )}
                </div>
                
                {/* Expanded Content - Only show when current step */}
                {currentStep === 1 && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <p className="text-xs sm:text-sm text-gray-500 mb-4 ml-11">
                      Customise your Short Link Or Dynamic URL to make it more professional and contextual.
                    </p>
                    <div className="ml-11">
                      <div className="mb-4">
                        <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">
                          Select App
                        </label>
                        <select
                          value={selectedAppId}
                          disabled={isEditMode}
                          onChange={(e) => {
                            const appId = e.target.value;
                            setSelectedAppId(appId);
                            const selectedApp = apps.find(app => (app._id || app.id) === appId);
                            if (selectedApp) {
                              const subDomain = selectedApp.subDomain || '';
                              const formattedDomain = subDomain.startsWith('http://') || subDomain.startsWith('https://') 
                                ? subDomain 
                                : `https://${subDomain}`;
                              setDomain(formattedDomain);
                            }
                          }}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          <option value="">Select an app</option>
                          {apps.map((app) => {
                            // Check if app is verified (either uses .chottu.link subdomain or has verified custom domain)
                            const isSubdomain = app.subDomain?.endsWith('.chottu.link');
                            const isVerified = isSubdomain || app.domainId?.status === 'verified';
                            const isPending = app.domainId && app.domainId.status !== 'verified';
                            
                            return (
                              <option 
                                key={app._id || app.id} 
                                value={app._id || app.id}
                                disabled={!isVerified}
                              >
                                {app.name} ({app.subDomain}){isPending ? ' - ⏳ Pending Verification' : ''}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div className="mb-4">
                        <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">
                          Domain
                        </label>
                        <input
                          type="text"
                          value={domain}
                          onChange={(e) => setDomain(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-100 text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/20"
                          readOnly
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">
                          Path <span className="text-destructive">*</span>
                        </label>
                        <input
                          type="text"
                          value={path}
                          onChange={(e) => {
                            if (isEditMode) return;
                            setError(null);
                            const v = e.target.value;
                            if (v === '' || !v.startsWith('/')) {
                              setPath(v === '' ? '/' : '/' + v.replace(/^\/+/, ''));
                            } else {
                              setPath(v);
                            }
                          }}
                          readOnly={isEditMode}
                          className={`w-full px-3 py-2 text-sm border rounded-xl text-gray-900 focus:outline-none placeholder:text-gray-500 ${
                            isEditMode
                              ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                              : 'bg-white border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent'
                          }`}
                          placeholder="/ e.g. home"
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={handleNext} disabled={!path || path.trim() === ''} variant="default" size="sm">
                          Next
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {currentStep >= 2 && (
                <div className={`bg-white rounded-2xl border shadow-sm transition-all duration-300 ${currentStep === 2 ? 'border-primary/40 ring-2 ring-primary/10' : 'border-gray-200'}`}>
                  <div 
                    className={`flex items-center gap-3 p-4 sm:p-6 ${currentStep !== 2 ? 'cursor-pointer hover:bg-gray-100 rounded-t-2xl' : ''}`}
                    onClick={() => currentStep !== 2 && setCurrentStep(2)}
                  >
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep > 2 ? 'bg-primary text-white' : 'bg-gray-900 text-white'}`}>
                      {currentStep > 2 ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : '2'}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Set up your dynamic link
                      </h3>
                      {currentStep > 2 && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 truncate">
                          {linkName || 'Unnamed'} → {destinationUrl}
                        </p>
                      )}
                    </div>
                    {currentStep > 2 && (
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Expanded Content - Only show when current step */}
                  {currentStep === 2 && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <p className="text-xs sm:text-sm text-gray-500 mb-4 ml-11">
                        A dynamic link is a deep link into your app that works whether or not your app is installed. On desktop it will go to the deep link url.
                      </p>
                      <div className="ml-11">
                        <div className="mb-4">
                          <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">
                            Destination URL
                          </label>
                          <input
                            type="url"
                            value={destinationUrl}
                            onChange={(e) => setDestinationUrl(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-500"
                            placeholder="E.g.: https://yourapp.com/welcome-page"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">
                            Link Name
                          </label>
                          <input
                            type="text"
                            value={linkName}
                            onChange={(e) => setLinkName(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-500"
                            placeholder="e.g. Seasonal Promo"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Pick a name that helps you recognize the link easily
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <Button onClick={handleNext} disabled={!destinationUrl || destinationUrl.trim() === ''} variant="default" size="sm">
                            Next
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep >= 3 && (
                <div className={`bg-white rounded-2xl border shadow-sm transition-all duration-300 ${currentStep === 3 ? 'border-primary/40 ring-2 ring-primary/10' : 'border-gray-200'}`}>
                  <div 
                    className={`flex items-center gap-3 p-4 sm:p-6 ${currentStep !== 3 ? 'cursor-pointer hover:bg-gray-100 rounded-t-2xl' : ''}`}
                    onClick={() => currentStep !== 3 && setCurrentStep(3)}
                  >
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep > 3 ? 'bg-primary text-white' : 'bg-gray-900 text-white'}`}>
                      {currentStep > 3 ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : '3'}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Define link behaviour for Apple
                      </h3>
                      {currentStep > 3 && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          {appleBehavior.includes('App') ? '📱 Open in App' : '🌐 Open in Browser'}
                        </p>
                      )}
                    </div>
                    {currentStep > 3 && (
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Expanded Content - Only show when current step */}
                  {currentStep === 3 && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <div className="ml-11">
                        <div className="space-y-3">
                          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                            <input
                              type="radio"
                              name="appleBehavior"
                              value="Open the Dynamic URL in a browser"
                              checked={appleBehavior === 'Open the Dynamic URL in a browser'}
                              onChange={(e) => setAppleBehavior(e.target.value)}
                              className="mt-1 w-4 h-4 text-primary border-gray-200 focus:ring-primary"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">
                                Open the Dynamic URL in a browser
                              </span>
                            </div>
                          </label>
                          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                            <input
                              type="radio"
                              name="appleBehavior"
                              value="Open the Dynamic URL in your Apple App"
                              checked={appleBehavior === 'Open the Dynamic URL in your Apple App'}
                              onChange={(e) => setAppleBehavior(e.target.value)}
                              className="mt-1 w-4 h-4 text-primary border-gray-200 focus:ring-primary"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">
                                Open the Dynamic URL in your Apple App
                              </span>
                            </div>
                          </label>
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button onClick={handleNext} variant="outline" size="sm">Next</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep >= 4 && (
                <div className={`bg-white rounded-2xl border shadow-sm transition-all duration-300 ${currentStep === 4 ? 'border-primary/40 ring-2 ring-primary/10' : 'border-gray-200'}`}>
                  <div 
                    className={`flex items-center gap-3 p-4 sm:p-6 ${currentStep !== 4 ? 'cursor-pointer hover:bg-gray-100 rounded-t-2xl' : ''}`}
                    onClick={() => currentStep !== 4 && setCurrentStep(4)}
                  >
                    <span className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${currentStep > 4 ? 'bg-primary text-white' : 'bg-gray-900 text-white'}`}>
                      {currentStep > 4 ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : '4'}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Define link behaviour for Android
                      </h3>
                      {currentStep > 4 && (
                        <p className="text-xs sm:text-sm text-gray-500 mt-1">
                          {androidBehavior.includes('App') ? '📱 Open in App' : '🌐 Open in Browser'}
                        </p>
                      )}
                    </div>
                    {currentStep > 4 && (
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Expanded Content - Only show when current step */}
                  {currentStep === 4 && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <div className="ml-11">
                        <div className="space-y-3">
                          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                            <input
                              type="radio"
                              name="androidBehavior"
                              value="Open the Dynamic URL in a browser"
                              checked={androidBehavior === 'Open the Dynamic URL in a browser'}
                              onChange={(e) => setAndroidBehavior(e.target.value)}
                              className="mt-1 w-4 h-4 text-primary border-gray-200 focus:ring-primary"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">
                                Open the Dynamic URL in a browser
                              </span>
                            </div>
                          </label>
                          <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                            <input
                              type="radio"
                              name="androidBehavior"
                              value="Open the Dynamic URL in your Android App"
                              checked={androidBehavior === 'Open the Dynamic URL in your Android App'}
                              onChange={(e) => setAndroidBehavior(e.target.value)}
                              className="mt-1 w-4 h-4 text-primary border-gray-200 focus:ring-primary"
                            />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-900">
                                Open the Dynamic URL in your Android App
                              </span>
                            </div>
                          </label>
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button onClick={handleNext} variant="outline" size="sm">Next</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {currentStep >= 5 && (
                <div className={`bg-white rounded-2xl border shadow-sm transition-all duration-300 ${currentStep === 5 ? 'border-primary/40 ring-2 ring-primary/10' : 'border-gray-200'}`}>
                  <div className="flex items-center gap-3 p-4 sm:p-6">
                    <span className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      5
                    </span>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        Campaign tracking, social tags and advanced options (optional)
                      </h3>
                    </div>
                  </div>
                  {currentStep === 5 && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <div className="ml-11">
                        <div className="mb-6">
                          <label className="flex items-center gap-2 mb-4 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={enableSocialMetaTags}
                              onChange={(e) => setEnableSocialMetaTags(e.target.checked)}
                              className="w-4 h-4 text-primary border-gray-200 rounded focus:ring-primary"
                            />
                            <span className="text-sm font-medium text-gray-900">
                              Add social meta tags for better sharing
                            </span>
                          </label>
                          {enableSocialMetaTags && (
                            <div className="ml-6 space-y-4">
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">Preview title (st)</label>
                                <input type="text" value={previewTitle} onChange={(e) => setPreviewTitle(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-primary placeholder:text-gray-500" placeholder="E.g.: Seasonal Promo" />
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">Preview image URL (si)</label>
                                <input type="url" value={previewImageUrl} onChange={(e) => setPreviewImageUrl(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-primary placeholder:text-gray-500" placeholder="E.g.: https://mydomain.com/images/promo.jpg" />
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">Preview description (sd)</label>
                                <textarea value={previewDescription} onChange={(e) => setPreviewDescription(e.target.value)} rows={3} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-primary placeholder:text-gray-500" placeholder="e.g. Some description..." />
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="flex items-center gap-2 mb-4 cursor-pointer">
                            <input type="checkbox" checked={enableUTMTracking} onChange={(e) => setEnableUTMTracking(e.target.checked)} className="w-4 h-4 text-primary border-gray-200 rounded focus:ring-primary" />
                            <span className="text-sm font-medium text-gray-900">Track a campaign with UTM parameters</span>
                          </label>
                          {enableUTMTracking && (
                            <div className="ml-6 space-y-4">
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">Campaign Source (utm_source)</label>
                                <input type="text" value={utmSource} onChange={(e) => setUtmSource(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-primary placeholder:text-gray-500" placeholder="e.g. Deeplink.in" />
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">Campaign medium (utm_medium)</label>
                                <input type="text" value={utmMedium} onChange={(e) => setUtmMedium(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-primary placeholder:text-gray-500" placeholder="e.g. cpc" />
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">Campaign name (utm_campaign)</label>
                                <input type="text" value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-primary placeholder:text-gray-500" placeholder="e.g. spring sale" />
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">Term name (utm_term)</label>
                                <input type="text" value={utmTerm} onChange={(e) => setUtmTerm(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-primary placeholder:text-gray-500" placeholder="e.g. email+spring+offer" />
                              </div>
                              <div>
                                <label className="block text-xs sm:text-sm font-medium text-gray-900 mb-2">UTM Content (utm_content)</label>
                                <input type="text" value={utmContent} onChange={(e) => setUtmContent(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-white text-gray-900 focus:ring-2 focus:ring-primary placeholder:text-gray-500" placeholder="e.g. image_top_banner" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {currentStep >= 2 ? <CheckIcon className="w-5 h-5 text-primary" /> : <WarningIcon className="w-5 h-5 text-destructive" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">Set up your dynamic link</h4>
                      {currentStep >= 2 && destinationUrl && <p className="text-xs text-gray-500 truncate">{destinationUrl}</p>}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {currentStep >= 3 ? <CheckIcon className="w-5 h-5 text-primary" /> : <EditIcon className="w-5 h-5 text-gray-500" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">Define link behaviour for Apple</h4>
                      {currentStep >= 3 && <p className="text-xs text-gray-500">{appleBehavior}</p>}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {currentStep >= 4 ? <CheckIcon className="w-5 h-5 text-primary" /> : <EditIcon className="w-5 h-5 text-gray-500" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">Define link behaviour for Android</h4>
                      {currentStep >= 4 && <p className="text-xs text-gray-500">{androidBehavior}</p>}
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {currentStep >= 5 ? <CheckIcon className="w-5 h-5 text-primary" /> : <EditIcon className="w-5 h-5 text-gray-500" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-gray-900 mb-1">Campaign tracking, social tags and advanced options (optional)</h4>
                      {currentStep >= 5 && (enableSocialMetaTags || enableUTMTracking) && (
                        <p className="text-xs text-gray-500">
                          {enableSocialMetaTags && enableUTMTracking ? 'Social tags & UTM tracking enabled' : enableSocialMetaTags ? 'Social tags enabled' : 'UTM tracking enabled'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={isEditMode ? handleUpdate : handleCreate}
                  disabled={isCreating || !path || !destinationUrl || !linkName || linkName.trim().length < 3 || linkName.trim().length > 30}
                  variant="hero"
                  size="default"
                >
                  {isCreating ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save changes' : 'Create link')}
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">QR Code</h3>
                  <QuestionMarkIcon className="w-4 h-4 text-gray-500" />
                </div>
                {domain && path && path.trim() !== '' ? (
                  <div className="flex flex-col items-center">
                    <div className="bg-white p-3 rounded-xl border border-gray-200 mb-3">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(domain + (path.startsWith('/') ? path : `/${path}`))}`}
                        alt="QR Code"
                        className="w-[180px] h-[180px]"
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center mb-3 break-all px-2 font-mono">
                      {domain}{path.startsWith('/') ? path : `/${path}`}
                    </p>
                    <a
                      href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&data=${encodeURIComponent(domain + (path.startsWith('/') ? path : `/${path}`))}`}
                      download={`qr-${path.replace(/^\//, '') || 'link'}.png`}
                      className="inline-flex items-center justify-center gap-2 h-9 rounded-md px-3 text-sm font-medium border border-input bg-white hover:bg-accent"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Download QR
                    </a>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center min-h-[200px] bg-gray-100">
                    <QRCodeIcon className="w-12 h-12 text-gray-500 mb-2" />
                    <p className="text-xs sm:text-sm text-gray-500 text-center">Enter a path to generate QR code</p>
                  </div>
                )}
              </div>
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Link Preview</h3>
                  <QuestionMarkIcon className="w-4 h-4 text-gray-500" />
                </div>
                {enableSocialMetaTags && (previewTitle || previewImageUrl || previewDescription) ? (
                  <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white shadow-sm">
                    {previewImageUrl ? (
                      <div className="aspect-video bg-gray-100 relative overflow-hidden">
                        <img src={previewImageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 200"><rect fill="%23f3f4f6"/></svg>'; }} />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gray-100 flex flex-col items-center justify-center">
                        <ImageIcon className="w-10 h-10 text-gray-500 mb-2" />
                        <p className="text-xs text-gray-500">Add image URL</p>
                      </div>
                    )}
                    <div className="p-3">
                      <p className="text-xs text-gray-500 mb-1 truncate">{domain.replace(/^https?:\/\//, '')}</p>
                      <h4 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{previewTitle || linkName || 'Your Link Title'}</h4>
                      {previewDescription && <p className="text-xs text-gray-500 line-clamp-2">{previewDescription}</p>}
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center min-h-[200px] mb-4 bg-gray-100">
                    <ImageIcon className="w-12 h-12 text-gray-500 mb-2" />
                    <p className="text-xs sm:text-sm text-gray-500 text-center">Enable social meta tags to see preview</p>
                  </div>
                )}
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-gray-500">Preview Title</label>
                    <p className="text-sm text-gray-900 mt-1">{enableSocialMetaTags && previewTitle ? previewTitle : '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500">Preview Description</label>
                    <p className="text-sm text-gray-900 mt-1 line-clamp-2">{enableSocialMetaTags && previewDescription ? previewDescription : '-'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
            )}
        </div>
      </main>
    </DashboardLayout>
    );
  }

  // Show links list view
  return (
    <DashboardLayout title="Links Manager" subtitle="Link List">
      {/* Delete confirmation modal */}
      {linkToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={handleDeleteCancel}>
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete link?</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete <span className="font-medium text-gray-900">"{linkToDelete.linkName || 'this link'}"</span>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={handleDeleteCancel}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteConfirm}
                disabled={deletingId === (linkToDelete._id || linkToDelete.id)}
              >
                {deletingId === (linkToDelete._id || linkToDelete.id) ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
      <main className="flex-1 overflow-y-auto bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Your Links</h2>
              <p className="text-sm text-gray-500 mt-1">Manage and track all your deep links</p>
            </div>
            <Button onClick={handleCreateClick} variant="hero" size="default" className="gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Link
            </Button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="ghost" size="sm" className="mt-2 text-destructive hover:text-destructive" onClick={loadLinks}>
                Retry
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mb-4" />
                <p className="text-gray-500">Loading links...</p>
              </div>
            </div>
          ) : links.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Links Yet</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Create your first deep link to get started with tracking and analytics.
                </p>
                <Button onClick={handleCreateClick} variant="hero">
                  Create Your First Link
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Short Link</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination URL</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clicks</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installs</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-border">
                    {links.map((link, index) => (
                      <tr
                        key={link._id || link.id || index}
                        className="hover:bg-gray-100 cursor-pointer transition-colors"
                        onClick={() => navigate(`/dashboard/links/${link._id || link.id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{link.linkName || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900 font-mono">
                              {link.domain && link.path ? `${link.domain}${link.path}` : '-'}
                            </span>
                            {link.domain && link.path && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-9 p-0 text-gray-500 hover:text-gray-900 shrink-0"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const url = `${link.domain}${link.path}`;
                                  navigator.clipboard.writeText(url);
                                  setCopiedLinkId(link._id || link.id);
                                  setTimeout(() => setCopiedLinkId(null), 2000);
                                }}
                                title="Copy link"
                              >
                                {copiedLinkId === (link._id || link.id) ? (
                                  <span className="text-xs text-primary">Copied!</span>
                                ) : (
                                  <Copy className="w-5 h-5" />
                                )}
                              </Button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500 truncate max-w-xs">{link.destinationUrl || '-'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{link.clicks ?? 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{link.installs ?? 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {link.createdAt ? new Date(link.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-500 hover:text-gray-900" title="Edit" onClick={(e) => handleEditClick(link, e)}>
                              <Pencil className="w-5 h-5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                              onClick={(e) => handleDeleteClick(link, e)}
                              disabled={deletingId === (link._id || link.id)}
                              title="Delete"
                            >
                              {deletingId === (link._id || link.id) ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Trash2 className="w-5 h-5" />
                              )}
                            </Button>
                          </div>
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

export default Links;

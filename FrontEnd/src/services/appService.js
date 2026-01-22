/**
 * App Service
 * Handles app creation and management API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

/**
 * Get authentication token from localStorage
 * Checks multiple possible key names for compatibility including Supabase format
 * @returns {string|null} The authentication token or null if not found
 */
const getAuthToken = () => {
  // Priority 1: Try primary key first (standard storage)
  let token = localStorage.getItem('authToken');
  if (token) {
    return token;
  }
  // No token found - log for debugging
  console.warn('No authentication token found in localStorage');
  console.log('Available localStorage keys:', Object.keys(localStorage));
  
  return null;
};

/**
 * Create a new app with Android and/or iOS configurations
 * @param {Object} appData - App creation data
 * @param {string} appData.name - App name
 * @param {string} appData.subDomain - Subdomain for the app
 * @param {string} appData.fallbackUrl - Fallback URL for mobile devices
 * @param {Object} appData.configurations - Platform configurations
 * @param {Object} [appData.configurations.android] - Android configuration
 * @param {string} [appData.configurations.android.packageName] - Android package name
 * @param {string} [appData.configurations.android.fingerPrint] - SHA256 fingerprint
 * @param {Object} [appData.configurations.ios] - iOS configuration
 * @param {string} [appData.configurations.ios.teamId] - Apple Team ID
 * @param {string} [appData.configurations.ios.bundleId] - Apple Bundle ID
 * @param {string} [appData.configurations.ios.storeId] - App Store ID
 * @returns {Promise<Object>} Created app data
 */
export const createApp = async (appData) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      console.error('Authentication token not found. User may need to sign in again.');
      throw new Error('Authentication required. Please sign in.');
    }
    
    console.log('Creating app with token:', token.substring(0, 20) + '...');
    console.log('App data:', JSON.stringify(appData, null, 2));

    const response = await fetch(`${API_BASE_URL}/app/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(appData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create app: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      app: data.app || data.data || data,
      message: data.message || 'App created successfully!',
    };
  } catch (error) {
    console.error('Create app API error:', error);
    throw error;
  }
};

/**
 * Create app with Android and/or iOS configurations
 * @param {Object} appConfig - Complete app configuration
 * @param {string} appConfig.name - App name
 * @param {string} appConfig.subDomain - Subdomain (e.g., "dev.something.com")
 * @param {string} appConfig.fallbackUrl - Fallback URL for mobile devices
 * @param {Object} [appConfig.android] - Android configuration (optional)
 * @param {string} [appConfig.android.packageName] - Android package name
 * @param {string} [appConfig.android.fingerPrint] - SHA256 fingerprint
 * @param {Object} [appConfig.ios] - iOS configuration (optional)
 * @param {string} [appConfig.ios.teamId] - Apple Team ID
 * @param {string} [appConfig.ios.bundleId] - Apple Bundle ID
 * @param {string} [appConfig.ios.storeId] - App Store ID
 * @returns {Promise<Object>} Created app data
 */
export const createAppWithConfigurations = async (appConfig) => {
  const payload = {
    name: appConfig.name,
    subDomain: appConfig.subDomain,
    fallbackUrl: appConfig.fallbackUrl,
    configurations: {},
  };

  // Add Android configuration if provided
  if (appConfig.android && (appConfig.android.packageName || appConfig.android.fingerPrint)) {
    payload.configurations.android = {};
    if (appConfig.android.packageName) {
      payload.configurations.android.packageName = appConfig.android.packageName;
    }
    if (appConfig.android.fingerPrint) {
      payload.configurations.android.fingerPrint = appConfig.android.fingerPrint;
    }
  }

  // Add iOS configuration if provided
  if (appConfig.ios && (appConfig.ios.teamId || appConfig.ios.bundleId || appConfig.ios.storeId)) {
    payload.configurations.ios = {};
    if (appConfig.ios.teamId) {
      payload.configurations.ios.teamId = appConfig.ios.teamId;
    }
    if (appConfig.ios.bundleId) {
      payload.configurations.ios.bundleId = appConfig.ios.bundleId;
    }
    if (appConfig.ios.storeId) {
      payload.configurations.ios.storeId = appConfig.ios.storeId;
    }
  }

  return createApp(payload);
};

/**
 * Get all links
 * Calls api/app/links endpoint
 * @returns {Promise<Object>} List of links
 */
export const getLinks = async () => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      console.error('Authentication token not found. User may need to sign in again.');
      throw new Error('Authentication required. Please sign in.');
    }

    const response = await fetch(`${API_BASE_URL}/app/links`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch links: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      links: data.links || data.data || data,
      message: data.message,
    };
  } catch (error) {
    console.error('Get links API error:', error);
    throw error;
  }
};

/**
 * Get link details by ID
 * @param {string} linkId - Link ID
 * @returns {Promise<Object>} Link details
 */
export const getLinkDetails = async (linkId) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      console.error('Authentication token not found. User may need to sign in again.');
      throw new Error('Authentication required. Please sign in.');
    }

    const response = await fetch(`${API_BASE_URL}/app/link/${linkId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch link details: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      link: data.link || data.data || data,
      message: data.message,
    };
  } catch (error) {
    console.error('Get link details API error:', error);
    throw error;
  }
};

/**
 * Get link analytics
 * @param {string} linkId - Link ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} Link analytics data
 */
export const getLinkAnalytics = async (linkId, startDate, endDate) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      console.error('Authentication token not found. User may need to sign in again.');
      throw new Error('Authentication required. Please sign in.');
    }

    const queryParams = new URLSearchParams({
      startDate: startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: endDate || new Date().toISOString().split('T')[0],
    });

    const response = await fetch(`${API_BASE_URL}/app/link/${linkId}/analytics?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch link analytics: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      analytics: data.analytics || data.data || data,
      message: data.message,
    };
  } catch (error) {
    console.error('Get link analytics API error:', error);
    throw error;
  }
};

/**
 * Create a new link
 * @param {Object} linkData - Link creation data
 * @param {string} linkData.domain - Domain URI (e.g., "https://earlyjobs.chottu.link")
 * @param {string} linkData.path - Path for the link (e.g., "/home")
 * @param {string} linkData.destinationUrl - Destination URL URI
 * @param {string} linkData.linkName - Link name (3-30 characters)
 * @param {string} linkData.androidBehavior - Android behavior: "open_app" or "open_url"
 * @param {string} linkData.iosBehavior - iOS behavior: "open_app" or "open_url"
 * @param {Object} [linkData.utm] - UTM and social meta tags (optional)
 * @param {string} [linkData.utm.previewTitle] - Preview title
 * @param {string} [linkData.utm.previewDescription] - Preview description
 * @param {string} [linkData.utm.previewImageUrl] - Preview image URL
 * @param {string} [linkData.utm.campaignSource] - Campaign source
 * @param {string} [linkData.utm.campaignMedium] - Campaign medium
 * @param {string} [linkData.utm.campaignName] - Campaign name
 * @param {string} [linkData.utm.campaignTerm] - Campaign term
 * @param {string} [linkData.utm.campaignContent] - Campaign content
 * @returns {Promise<Object>} Created link data
 */
export const createLink = async (linkData) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      console.error('Authentication token not found. User may need to sign in again.');
      throw new Error('Authentication required. Please sign in.');
    }
    
    console.log('Creating link with data:', JSON.stringify(linkData, null, 2));

    const response = await fetch(`${API_BASE_URL}/app/link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(linkData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to create link: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      link: data.link || data.data || data,
      message: data.message || 'Link created successfully!',
    };
  } catch (error) {
    console.error('Create link API error:', error);
    throw error;
  }
};

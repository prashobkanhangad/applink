/**
 * Domain Service
 * Handles domain verification API calls
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

/**
 * Get authentication token from localStorage
 * @returns {string|null} The authentication token or null if not found
 */
const getAuthToken = () => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.warn('No authentication token found in localStorage');
  }
  return token;
};

/**
 * Add a new domain for verification
 * @param {Object} domainData - Domain data
 * @param {string} domainData.domain - Domain name (e.g., "example.com")
 * @param {string} [domainData.verificationMethod] - Verification method: "txt" or "html" (default: "txt")
 * @returns {Promise<Object>} Domain verification data with instructions
 */
export const addDomain = async (domainData) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required. Please sign in.');
    }

    const response = await fetch(`${API_BASE_URL}/domain/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(domainData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to add domain: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      domain: data.data?.domain || data.data,
      verificationToken: data.data?.verificationToken,
      instructions: data.data?.instructions,
      message: data.message || 'Domain added successfully',
    };
  } catch (error) {
    console.error('Add domain API error:', error);
    throw error;
  }
};

/**
 * Verify a domain by checking DNS records
 * @param {string} domainId - Domain verification record ID
 * @returns {Promise<Object>} Updated domain verification data
 */
export const verifyDomain = async (domainId) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required. Please sign in.');
    }

    const response = await fetch(`${API_BASE_URL}/domain/verify/${domainId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to verify domain: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      domain: data.data,
      message: data.message || 'Domain verification completed',
    };
  } catch (error) {
    console.error('Verify domain API error:', error);
    throw error;
  }
};

/**
 * Get all domains for the current user
 * @returns {Promise<Object>} List of domains
 */
export const getDomains = async () => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required. Please sign in.');
    }

    const response = await fetch(`${API_BASE_URL}/domain/list`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch domains: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      domains: data.data || data.domains || [],
      message: data.message,
    };
  } catch (error) {
    console.error('Get domains API error:', error);
    throw error;
  }
};

/**
 * Get a specific domain by ID
 * @param {string} domainId - Domain verification record ID
 * @returns {Promise<Object>} Domain details with verification instructions
 */
export const getDomain = async (domainId) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required. Please sign in.');
    }

    const response = await fetch(`${API_BASE_URL}/domain/${domainId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch domain: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      domain: data.data,
      instructions: data.data?.instructions,
      message: data.message,
    };
  } catch (error) {
    console.error('Get domain API error:', error);
    throw error;
  }
};

/**
 * Delete a domain verification record
 * @param {string} domainId - Domain verification record ID
 * @returns {Promise<Object>} Success message
 */
export const deleteDomain = async (domainId) => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication required. Please sign in.');
    }

    const response = await fetch(`${API_BASE_URL}/domain/${domainId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to delete domain: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || 'Domain removed successfully',
    };
  } catch (error) {
    console.error('Delete domain API error:', error);
    throw error;
  }
};

/**
 * Authentication Service
 * Handles Google OAuth and API authentication
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

/**
 * Initialize Google Identity Services
 * Waits for Google Identity Services to load
 */
export const waitForGoogleIdentity = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve(window.google.accounts.id);
      return;
    }

    let attempts = 0;
    const maxAttempts = 50; // 5 seconds max wait

    const checkGoogle = setInterval(() => {
      attempts++;
      if (window.google?.accounts?.id) {
        clearInterval(checkGoogle);
        resolve(window.google.accounts.id);
      } else if (attempts >= maxAttempts) {
        clearInterval(checkGoogle);
        reject(new Error('Google Identity Services failed to load'));
      }
    }, 100);
  });
};

/**
 * Initiate Google OAuth flow using Google Identity Services
 */
export const initiateGoogleAuth = async () => {
  try {
    // Wait for Google Identity Services to load
    const googleIdentity = await waitForGoogleIdentity();

    return new Promise((resolve, reject) => {
      // Configure Google OAuth
      googleIdentity.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            // Decode the credential (JWT token)
            const credential = response.credential;
            
            // Decode JWT to get user info (client-side decode, not verification)
            const base64Url = credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            
            const decodedToken = JSON.parse(jsonPayload);
            
            // Extract user information
            const googleUser = {
              id: decodedToken.sub,
              email: decodedToken.email,
              name: decodedToken.name,
              picture: decodedToken.picture,
              idToken: credential, // Full JWT token for backend verification
            };

            resolve(googleUser);
          } catch (error) {
            reject(new Error('Failed to process Google authentication: ' + error.message));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Trigger the One Tap or Sign In popup
      googleIdentity.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If One Tap is not available, use button flow
          // The button click will trigger the popup
          reject(new Error('Google Sign-In popup required'));
        }
      });
    });
  } catch (error) {
    console.error('Google OAuth initialization error:', error);
    throw error;
  }
};

/**
 * Trigger Google Sign-In popup programmatically
 * Uses Google Identity Services One Tap or popup
 */
export const triggerGoogleSignIn = async () => {
  try {
    const googleIdentity = await waitForGoogleIdentity();

    if (!GOOGLE_CLIENT_ID) {
      throw new Error('Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.');
    }

    return new Promise((resolve, reject) => {
      // Initialize Google Identity Services
      googleIdentity.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const credential = response.credential;
            
            // Decode JWT to get user info
            const base64Url = credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            
            const decodedToken = JSON.parse(jsonPayload);
            
            const googleUser = {
              id: decodedToken.sub,
              email: decodedToken.email,
              name: decodedToken.name,
              picture: decodedToken.picture,
              idToken: credential,
            };

            resolve(googleUser);
          } catch (error) {
            reject(new Error('Failed to process Google authentication: ' + error.message));
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Try to show One Tap first
      googleIdentity.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          // One Tap not available, user needs to click button
          // The button click will trigger the popup
          reject(new Error('Please click the Google Sign-In button to continue.'));
        } else if (notification.isSkippedMoment()) {
          // User dismissed One Tap, show button instead
          reject(new Error('Please click the Google Sign-In button to continue.'));
        } else if (notification.isDismissedMoment()) {
          // User dismissed the prompt
          reject(new Error('Sign-in was cancelled.'));
        }
      });
    });
  } catch (error) {
    console.error('Google Sign-In error:', error);
    throw error;
  }
};

/**
 * Create a Google Sign-In button element
 * Returns a function to trigger sign-in
 */
export const createGoogleSignInButton = (onSuccess, onError) => {
  return async () => {
    try {
      const googleIdentity = await waitForGoogleIdentity();

      if (!GOOGLE_CLIENT_ID) {
        throw new Error('Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.');
      }

      googleIdentity.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response) => {
          try {
            const credential = response.credential;
            
            // Decode JWT
            const base64Url = credential.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
              atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
            );
            
            const decodedToken = JSON.parse(jsonPayload);
            
            const googleUser = {
              id: decodedToken.sub,
              email: decodedToken.email,
              name: decodedToken.name,
              picture: decodedToken.picture,
              idToken: credential,
            };

            if (onSuccess) {
              onSuccess(googleUser);
            }
          } catch (error) {
            if (onError) {
              onError(error);
            }
          }
        },
      });

      // Trigger the popup
      googleIdentity.prompt();
    } catch (error) {
      if (onError) {
        onError(error);
      }
    }
  };
};

/**
 * Authenticate user with Google credentials
 * Calls api/auth endpoint - handles both signup and signin
 */
export const authenticateWithGoogle = async (googleUser) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider: 'google',
        idToken: googleUser.idToken, // JWT token from Google
        email: googleUser.email,
        // name: googleUser.name,
        picture: googleUser.picture,
        // id: googleUser.id,
      }),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Check for token in various possible response formats
    // API response structure: { status, message, data: { token, refreshToken, ... } }
    const token = data.data?.token || data.token || data.accessToken || data.access_token || data.authToken;
    
    // Extract user data from response
    const userData = data.data || data.user || {};
    
    if (!token) {
      console.warn('No token found in API response:', data);
      console.log('Response structure:', JSON.stringify(data, null, 2));
    } else {
      console.log('Token received from API:', token.substring(0, 20) + '...');
      console.log('Storing token in localStorage as authToken');
    }
    
    return {
      success: true,
      isNewUser: data.isNewUser || data.data?.isNewUser || false, // Indicates if user was just registered
      user: {
        username: userData.username,
        email: userData.email,
        createdAt: userData.createdAt,
        ...userData,
      },
      token: token,
      refreshToken: data.data?.refreshToken || data.refreshToken,
      message: data.message || (data.isNewUser ? 'Account created successfully!' : 'Signed in successfully!'),
    };
  } catch (error) {
    // Handle network errors or API errors
    console.error('Auth API error:', error);
    
    // For development: simulate successful auth if API is not available
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.warn('API not available, using mock response');
      return {
        success: true,
        isNewUser: false, // Assume existing user for mock
        user: {
          id: googleUser.id,
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
        },
        token: 'mock_jwt_token',
        message: 'Signed in successfully!',
      };
    }
    
    throw error;
  }
};

/**
 * Complete Google sign-in/sign-up flow
 */
export const signInWithGoogle = async () => {
  try {
    // Step 1: Get Google user credentials via popup
    const googleUser = await triggerGoogleSignIn();
    
    // Step 2: Authenticate with backend
    const authResult = await authenticateWithGoogle(googleUser);
    
    // Step 3: Store auth token (in localStorage or cookie)
    if (authResult.token) {
      localStorage.setItem('authToken', authResult.token);
      localStorage.setItem('user', JSON.stringify(authResult.user));
    }
    
    return authResult;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
};

/**
 * Get current authenticated user information
 * Calls api/auth/me endpoint
 * @returns {Promise<Object>} Current user data
 */
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required. Please sign in.');
    }

    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Token expired or invalid, clear storage
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        throw new Error('Session expired. Please sign in again.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to fetch user data: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Handle different response structures
    // API response: { status, message, data: { username, email, createdAt, isAppExists, userType, currentPlan } }
    const userData = data.data || data.user || data;
    
    // Update localStorage with fresh user data
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    return {
      success: true,
      user: userData,
      isAppExists: userData?.isAppExists || false,
      userType: userData?.userType,
      currentPlan: userData?.currentPlan,
    };
  } catch (error) {
    console.error('Get current user API error:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 * Clears authentication data from local storage
 */
export const signOut = () => {
  try {
    // Clear local storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    
    // Revoke Google session if available
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.disableAutoSelect();
      } catch (error) {
        console.warn('Failed to revoke Google session:', error);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    // Still clear local storage even if there's an error
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    throw error;
  }
};

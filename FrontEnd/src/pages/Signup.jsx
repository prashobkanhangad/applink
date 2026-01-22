import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container } from '../design-system';
import { authenticateWithGoogle, waitForGoogleIdentity } from '../services/authService';

export const Signup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const buttonRef = useRef(null);
  const isInitialized = useRef(false);

  // Initialize Google Sign-In button
  useEffect(() => {
    const initializeGoogleButton = async () => {
      if (isInitialized.current) return;

      try {
        const googleIdentity = await waitForGoogleIdentity();
        const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

        if (!GOOGLE_CLIENT_ID) {
          console.warn('VITE_GOOGLE_CLIENT_ID is not set. Using mock authentication.');
          return;
        }

        googleIdentity.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCallback,
        });

        if (buttonRef.current) {
          googleIdentity.renderButton(buttonRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            width: '100%',
          });
          isInitialized.current = true;
        }
      } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
      }
    };

    initializeGoogleButton();
  }, []);

  const handleGoogleCallback = async (response) => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Decode JWT token
      const credential = response.credential;
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

      // Authenticate with backend
      const result = await authenticateWithGoogle(googleUser);
      
      if (result.success) {
        setSuccessMessage(result.message);
        // Store auth data
        if (result.token) {
          localStorage.setItem('authToken', result.token);
          localStorage.setItem('user', JSON.stringify(result.user));
        }
        // Navigate to dashboard after successful auth
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      }
    } catch (error) {
      console.error('Google authentication error:', error);
      setError(error.message || 'Failed to sign in with Google. Please try again.');
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const googleIdentity = await waitForGoogleIdentity();
      const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

      if (!GOOGLE_CLIENT_ID) {
        throw new Error('Google Client ID is not configured. Please set VITE_GOOGLE_CLIENT_ID in your environment variables.');
      }

      googleIdentity.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });

      // Trigger popup
      googleIdentity.prompt();
    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(error.message || 'Failed to sign in with Google. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-grow flex items-center py-12 md:py-16">
        <Container>
          <div className="max-w-md mx-auto w-full">
            {/* Signup Card */}
            <div className="bg-background-surface rounded-lg border border-border-default shadow-md p-8 md:p-10">
              {/* Header */}
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-semibold text-text-primary mb-3">
                  Create your account
                </h1>
                <p className="text-base text-text-secondary">
                  Get started with DeepLink in seconds
                </p>
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

              {/* Google Sign In Button Container */}
              <div className="mb-6">
                {isLoading ? (
                  <div className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg">
                    <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-base font-medium text-gray-700">
                      {successMessage ? 'Redirecting...' : 'Signing in...'}
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Google Sign-In Button (rendered by Google) */}
                    <div ref={buttonRef} className="w-full"></div>
                    
                    {/* Fallback Custom Button */}
                    {!import.meta.env.VITE_GOOGLE_CLIENT_ID && (
                      <button
                        onClick={handleGoogleSignIn}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border-2 border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 shadow-sm"
                      >
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          />
                        </svg>
                        <span className="text-base font-medium text-gray-700">
                          Continue with Google
                        </span>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-default"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background-surface text-text-muted">
                    Secure sign-in powered by Google
                  </span>
                </div>
              </div>

              {/* Terms */}
              <p className="text-xs text-text-muted text-center leading-relaxed">
                By continuing, you agree to DeepLink's{' '}
                <a href="#terms" className="text-primary-600 hover:text-primary-700">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" className="text-primary-600 hover:text-primary-700">
                  Privacy Policy
                </a>
                .
              </p>

              {/* Sign In Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-text-secondary">
                  Already have an account?{' '}
                  <a href="#signin" className="text-primary-600 hover:text-primary-700 font-medium">
                    Sign in
                  </a>
                </p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-sm text-text-muted">
                Need help?{' '}
                <a href="#support" className="text-primary-600 hover:text-primary-700">
                  Contact support
                </a>
              </p>
            </div>
          </div>
        </Container>
      </main>
    </div>
  );
};

export default Signup;

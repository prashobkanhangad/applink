import { useEffect, useRef } from 'react';

/**
 * Hook to initialize and handle Google Sign-In button
 */
export const useGoogleAuth = (onSuccess, onError) => {
  const buttonRef = useRef(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (isInitialized.current || !window.google?.accounts?.id) {
        return;
      }

      const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

      if (!GOOGLE_CLIENT_ID) {
        console.warn('VITE_GOOGLE_CLIENT_ID is not set. Google Sign-In will not work.');
        return;
      }

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: async (response) => {
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

        // Render button if ref exists
        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            width: '100%',
          });
        }

        isInitialized.current = true;
      } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
        if (onError) {
          onError(error);
        }
      }
    };

    // Wait for Google Identity Services to load
    if (window.google?.accounts?.id) {
      initializeGoogleSignIn();
    } else {
      // Poll for Google Identity Services
      let attempts = 0;
      const maxAttempts = 50;
      const checkInterval = setInterval(() => {
        attempts++;
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          initializeGoogleSignIn();
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          if (onError) {
            onError(new Error('Google Identity Services failed to load'));
          }
        }
      }, 100);
    }

    return () => {
      // Cleanup if needed
    };
  }, [onSuccess, onError]);

  return { buttonRef };
};

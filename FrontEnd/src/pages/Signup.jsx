import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authenticateWithGoogle, waitForGoogleIdentity } from '../services/authService';
import { PageMeta } from '../components/PageMeta';
import { useTheme } from '../contexts/ThemeContext';

const META = {
  title: 'Sign Up',
  description: 'Create your DeepLink account. Get started with deep linking and attribution in seconds. Sign in with Google.',
};

export const Signup = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/logo_light.png" : "/logo_dark.png";
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [showFallbackButton, setShowFallbackButton] = useState(false);
  const buttonRef = useRef(null);
  const isInitialized = useRef(false);

  // Initialize Google Sign-In button
  useEffect(() => {
    const initializeGoogleButton = async () => {
      if (isInitialized.current) return;

      const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

      if (!GOOGLE_CLIENT_ID) {
        console.warn('VITE_GOOGLE_CLIENT_ID is not set. Showing fallback button.');
        setShowFallbackButton(true);
        return;
      }

      try {
        const googleIdentity = await waitForGoogleIdentity();

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
          
          // Check if button was actually rendered after a short delay
          setTimeout(() => {
            if (buttonRef.current && buttonRef.current.children.length === 0) {
              console.warn('Google button did not render, showing fallback');
              setShowFallbackButton(true);
            }
          }, 1000);
        }
      } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
        setShowFallbackButton(true);
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
    <div className="min-h-screen bg-background relative overflow-hidden link-pattern">
      <PageMeta title={META.title} description={META.description} path="/signup" />
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-[hsl(200_85%_50%)]/5 blur-[100px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      <main className="relative z-10 flex items-center justify-center min-h-screen py-12 md:py-16 px-6">
        <div className="w-full max-w-md">
          {/* Signup Card */}
          <motion.div
            className="bg-card rounded-2xl border border-border shadow-xl p-8 md:p-10"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Logo */}
            <motion.div
              className="flex justify-center mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <img
                src={logoSrc}
                alt="DeepLink"
                className="h-24 w-auto object-contain"
              />
            </motion.div>

            {/* Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-3">
                Create your account
              </h1>
              <p className="text-muted-foreground">
                Get started with DeepLink in seconds
              </p>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center gap-3 dark:bg-green-500/20 dark:border-green-500/30"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Sign In Button Container */}
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {isLoading ? (
                <div className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-secondary rounded-lg border border-border">
                  <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-base font-medium text-foreground">
                    {successMessage ? 'Redirecting...' : 'Signing in...'}
                  </span>
                </div>
              ) : (
                <div className="w-full">
                  {/* Google Sign-In Button (rendered by Google) */}
                  {!showFallbackButton && (
                    <div 
                      ref={buttonRef} 
                      className="w-full min-h-[48px] flex items-center justify-center"
                      style={{ minHeight: '48px' }}
                    ></div>
                  )}
                  
                  {/* Fallback Custom Button - Show if no Google Client ID or if Google button fails to render */}
                  {showFallbackButton && (
                    <button
                      onClick={handleGoogleSignIn}
                      className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-card border-2 border-border rounded-lg hover:border-primary/50 hover:bg-secondary/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 shadow-sm min-h-[48px]"
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
                      <span className="text-base font-medium text-foreground">
                        Continue with Google
                      </span>
                    </button>
                  )}
                </div>
              )}
            </motion.div>

            {/* Divider */}
            <motion.div
              className="relative mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-card text-muted-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Secure sign-in powered by Google
                </span>
              </div>
            </motion.div>

            {/* Terms */}
            <motion.p
              className="text-xs text-muted-foreground text-center leading-relaxed mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              By continuing, you agree to DeepLink's{' '}
              <Link to="/terms" className="text-primary hover:text-primary/80 underline underline-offset-2">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary hover:text-primary/80 underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </motion.p>

            {/* Sign In Link */}
            <motion.div
              className="text-center pt-4 border-t border-border"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/signup" className="text-primary hover:text-primary/80 font-medium">
                  Sign in
                </Link>
              </p>
            </motion.div>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <p className="text-sm text-muted-foreground">
              Need help?{' '}
              <a href="#support" className="text-primary hover:text-primary/80">
                Contact support
              </a>
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Signup;

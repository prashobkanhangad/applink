/**
 * Design System Tokens
 * 
 * This file exports design tokens for consistent usage across the application.
 * All tokens are WCAG AA compliant and follow the 8-point spacing system.
 */

export const colors = {
  // Primary Color Palette
  primary: {
    base: '#6366f1',   // primary-500
    hover: '#4f46e5', // primary-600
    active: '#4338ca', // primary-700
  },
  
  // Accent Color Palette
  accent: {
    base: '#14b8a6',   // accent-500
    hover: '#0d9488',  // accent-600
  },
  
  // Background Colors
  background: {
    default: '#ffffff',
    surface: '#f9fafb',  // gray-50
    muted: '#f3f4f6',    // gray-100
  },
  
  // Border Colors
  border: {
    default: '#e5e7eb',  // gray-200
    muted: '#f3f4f6',     // gray-100
    strong: '#d1d5db',    // gray-300
  },
  
  // Text Colors (use as text-text-primary, text-text-secondary, text-text-muted)
  text: {
    primary: '#111827',   // gray-900
    secondary: '#4b5563', // gray-600
    muted: '#6b7280',     // gray-500
  },
  
  // Tailwind Class Reference
  // Primary: bg-primary-500, text-primary-600, border-primary-500
  // Accent: bg-accent-500, text-accent-600, border-accent-500
  // Background: bg-background, bg-background-surface, bg-background-muted
  // Border: border-border, border-border-muted, border-border-strong
  // Text: text-text-primary, text-text-secondary, text-text-muted
};

export const typography = {
  // Font Family
  fontFamily: {
    sans: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ],
  },
  
  // Font Sizes (mobile-first)
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px - Body
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '2rem',      // 32px - H2
    '4xl': '2.5rem',    // 40px
    '5xl': '3rem',      // 48px - H1 Hero
    '6xl': '3.75rem',   // 60px - Large Hero
  },
  
  // Line Heights
  lineHeight: {
    tight: '1.1',
    normal: '1.5',
    relaxed: '1.75',
  },
  
  // Font Weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const spacing = {
  // 8-point spacing system
  0: '0',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  2: '0.5rem',       // 8px
  3: '0.75rem',      // 12px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  8: '2rem',         // 32px
  10: '2.5rem',      // 40px
  12: '3rem',        // 48px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
  32: '8rem',        // 128px
};

export const layout = {
  // Max Content Width
  maxWidth: {
    content: '1100px',
    contentWide: '1200px',
  },
  
  // Section Padding
  sectionPadding: {
    sm: '3rem',   // 48px - Mobile
    default: '4rem', // 64px - Default
    lg: '6rem',   // 96px - Large screens
  },
};

export const borderRadius = {
  sm: '0.25rem',      // 4px
  default: '0.375rem', // 6px
  md: '0.5rem',       // 8px
  lg: '0.75rem',      // 12px
  xl: '1rem',         // 16px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  default: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
};

export const transitions = {
  default: '150ms ease-in-out',
  fast: '100ms ease-in-out',
  slow: '300ms ease-in-out',
};

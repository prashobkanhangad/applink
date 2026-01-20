/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Color System - WCAG AA Compliant
      colors: {
        // Primary: Deep Blue/Indigo
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1', // Base primary
          600: '#4f46e5', // Hover
          700: '#4338ca', // Active
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Accent: Teal/Emerald
        accent: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6', // Base accent
          600: '#0d9488', // Hover
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
          950: '#042f2e',
        },
        // Note: Gray scale uses Tailwind's default gray-50 to gray-900
        // Semantic Colors - Access via bg-background, text-text-primary, etc.
        background: {
          DEFAULT: '#ffffff',
          surface: '#f9fafb',  // gray-50
          muted: '#f3f4f6',    // gray-100
        },
        border: {
          DEFAULT: '#e5e7eb',  // gray-200
          muted: '#f3f4f6',    // gray-100
          strong: '#d1d5db',   // gray-300
        },
        // Text colors - use as text-text-primary, text-text-secondary, text-text-muted
        text: {
          primary: '#111827',   // gray-900
          secondary: '#4b5563',  // gray-600
          muted: '#6b7280',      // gray-500
        },
      },
      // Typography System
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ],
      },
      fontSize: {
        // Mobile-first, scales up
        'xs': ['0.75rem', { lineHeight: '1rem' }],      // 12px / 16px
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],  // 14px / 20px
        'base': ['1rem', { lineHeight: '1.5rem' }],     // 16px / 24px - Body
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],  // 18px / 28px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],   // 20px / 28px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],      // 24px / 32px
        '3xl': ['2rem', { lineHeight: '2.5rem' }],     // 32px / 40px - H2
        '4xl': ['2.5rem', { lineHeight: '3rem' }],      // 40px / 48px
        '5xl': ['3rem', { lineHeight: '1.1' }],        // 48px - H1 Hero
        '6xl': ['3.75rem', { lineHeight: '1.1' }],     // 60px - Large Hero
      },
      // Spacing System - 8-point grid
      spacing: {
        '0.5': '0.125rem',   // 2px
        '1': '0.25rem',      // 4px
        '1.5': '0.375rem',   // 6px
        '2': '0.5rem',       // 8px
        '2.5': '0.625rem',   // 10px
        '3': '0.75rem',      // 12px
        '3.5': '0.875rem',   // 14px
        '4': '1rem',         // 16px
        '5': '1.25rem',      // 20px
        '6': '1.5rem',       // 24px
        '7': '1.75rem',      // 28px
        '8': '2rem',         // 32px
        '9': '2.25rem',      // 36px
        '10': '2.5rem',      // 40px
        '11': '2.75rem',     // 44px
        '12': '3rem',        // 48px
        '14': '3.5rem',      // 56px
        '16': '4rem',        // 64px
        '20': '5rem',        // 80px
        '24': '6rem',        // 96px
        '28': '7rem',        // 112px
        '32': '8rem',        // 128px
      },
      // Layout Constraints
      maxWidth: {
        'content': '1100px',
        'content-wide': '1200px',
      },
      // Section Padding (using spacing scale: py-12=48px, py-16=64px, py-24=96px)
      // Border Radius
      borderRadius: {
        'sm': '0.25rem',     // 4px
        'DEFAULT': '0.375rem', // 6px
        'md': '0.5rem',      // 8px
        'lg': '0.75rem',     // 12px
        'xl': '1rem',        // 16px
      },
    },
  },
  plugins: [],
}

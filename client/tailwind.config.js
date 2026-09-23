/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',    // tablet: 768px - 1023px
      lg: '1024px',   // desktop: 1024px - 1279px
      xl: '1280px',   // wide: 1280px+
      '2xl': '1536px',
    },
    extend: {
      maxWidth: {
        content: '1200px',
      },
      colors: {
        // Authoritative Institutional Navy Base
        navy: {
          deepest: '#060D1F', // Page background, hero
          deep: '#0B1629',    // Header, footer, dark cards
          mid: '#162040',     // Dark section backgrounds
          surface: '#1C2B4A', // Card backgrounds in dark zones
          border: '#253659',  // Borders in dark zones
        },
        // Single Gold Accent
        gold: {
          primary: '#C9A84C', // Primary accent — CTAs, highlights, icons
          light: '#E8C97A',   // Hover states, secondary gold
          muted: '#8A6F2E',   // Subtle gold, borders
        },
        // Crisp Content Surfaces
        white: '#FFFFFF',
        'off-white': '#F5F7FA', // Alternating section backgrounds

        // Typography Color Scale
        text: {
          primary: '#1A2332',     // Body text on light backgrounds
          secondary: '#4A5568',   // Supporting text, metadata
          'on-dark': '#E2E8F0',   // Body text on dark backgrounds
          'muted-dark': '#8AA3C2',// Metadata on dark backgrounds
        },

        // Status & Utility Colors
        success: '#0D9488', // Verified badges, positive stats
        warning: '#D97706', // Risk warnings, unverified
        danger: '#DC2626',  // Alerts, complaint status
        star: '#F59E0B',    // Rating stars

        // Aliases for compatibility
        primary: {
          DEFAULT: '#0B1629',
          dark: '#060D1F',
          light: '#162040',
        },
        secondary: {
          DEFAULT: '#1C2B4A',
          dark: '#162040',
          light: '#253659',
        },
        accent: {
          gold: '#C9A84C',
          'gold-light': '#E8C97A',
          'gold-dark': '#8A6F2E',
          green: '#0D9488',
          'green-light': '#14B8A6',
          'green-dark': '#0F766E',
        },
        background: '#060D1F',
        card: {
          DEFAULT: '#1C2B4A',
          hover: '#253659',
        },
        border: '#253659',
        brand: {
          darkest: '#060D1F',
          dark: '#0B1629',
          card: '#1C2B4A',
          surface: '#162040',
          border: '#253659',
          muted: '#8AA3C2',
          gold: '#C9A84C',
          'gold-light': '#E8C97A',
          'gold-dark': '#8A6F2E',
          green: '#0D9488',
          red: '#DC2626',
        },
      },
      fontFamily: {
        serif: ['var(--font-dm-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['var(--font-dm-serif)', 'Georgia', 'serif'],
      },
      spacing: {
        'space-1': '4px',
        'space-2': '8px',
        'space-3': '12px',
        'space-4': '16px',
        'space-5': '20px',
        'space-6': '24px',
        'space-8': '32px',
        'space-10': '40px',
        'space-12': '48px',
        'space-16': '64px',
        'space-20': '80px',
        'space-24': '96px',
      },
      borderRadius: {
        sm: '4px',    // tags, badges, table cells
        md: '8px',    // cards, inputs, buttons
        lg: '16px',   // modal, large cards
        full: '9999px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.08), 0 4px 16px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.12), 0 8px 32px rgba(0,0,0,0.10)',
        modal: '0 20px 60px rgba(0,0,0,0.3)',
        'glow-gold': '0 0 25px -5px rgba(201, 168, 76, 0.35)',
      },
    },
  },
  plugins: [],
};

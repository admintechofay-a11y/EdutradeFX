import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0A0F1E',
          secondary: '#111827',
          card: '#1C2333',
        },
        border: {
          DEFAULT: '#2D3748',
          subtle: '#1E293B',
        },
        primary: {
          DEFAULT: '#3B82F6',
          hover: '#2563EB',
          light: '#60A5FA',
        },
        accent: {
          gold: '#F59E0B',
          'gold-hover': '#D97706',
        },
        semantic: {
          success: '#10B981',
          error: '#EF4444',
          warning: '#F59E0B',
          info: '#3B82F6',
        },
        text: {
          primary: '#F9FAFB',
          secondary: '#9CA3AF',
          muted: '#6B7280',
        },
      },
      borderRadius: {
        card: '8px',
        button: '6px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 25px -5px rgba(59, 130, 246, 0.25)',
        'glow-gold': '0 0 25px -5px rgba(245, 158, 11, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;

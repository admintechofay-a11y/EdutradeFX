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
      screens: {
        xs: '420px',
        '3xl': '1920px',
      },
      colors: {
        // Core fintech brand tokens
        navy: {
          DEFAULT: '#0A2A6B',
          deep: '#071B4D',
          light: '#133E96',
        },
        blue: {
          DEFAULT: '#1F5BFF',
          hover: '#1749D6',
          50: '#EEF4FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#1F5BFF',
          600: '#1749D6',
        },
        orange: {
          DEFAULT: '#FF6A00',
          hover: '#E85F00',
          50: '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          500: '#FF6A00',
          600: '#E85F00',
        },
        green: {
          DEFAULT: '#16A34A',
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#16A34A',
          600: '#15803D',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          tint: '#EEF4FF',
          subtle: '#F8FAFC',
        },
        border: {
          DEFAULT: '#E2E8F0',
          subtle: '#F1F5F9',
        },
        text: {
          heading: '#0F172A',
          body: '#475569',
          muted: '#94A3B8',
          // Compatibility aliases
          primary: '#0F172A',
          secondary: '#475569',
        },
        semantic: {
          success: '#16A34A',
          error: '#DC2626',
          warning: '#F59E0B',
          info: '#1F5BFF',
        },

        // Backward compatibility mappings
        'brand-navy': '#0A2A6B',
        'brand-navy-card': '#FFFFFF',
        'brand-navy-light': '#F8FAFC',
        'brand-blue': '#1F5BFF',
        'brand-cyan': '#06B6D4',
        'brand-amber': '#FF6A00',
        background: {
          DEFAULT: '#FFFFFF',
          secondary: '#F8FAFC',
          card: '#FFFFFF',
        },
        primary: {
          DEFAULT: '#1F5BFF',
          hover: '#1749D6',
          light: '#EEF4FF',
        },
        accent: {
          gold: '#FF6A00',
          'gold-hover': '#E85F00',
          orange: '#FF6A00',
        },
      },
      borderRadius: {
        card: '16px',
        button: '9999px',
        pill: '9999px',
        '2xl': '16px',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'soft': '0 8px 24px rgba(10, 42, 107, 0.08)',
        'lift': '0 16px 32px rgba(10, 42, 107, 0.14)',
        'glow': '0 0 25px -5px rgba(31, 91, 255, 0.25)',
        'glow-orange': '0 0 25px -5px rgba(255, 106, 0, 0.25)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0A2A6B 0%, #1F5BFF 100%)',
        'cta-banner': 'linear-gradient(135deg, #1F5BFF 0%, #FF6A00 100%)',
        'surface-gradient': 'linear-gradient(180deg, #FFFFFF 0%, #EEF4FF 100%)',
      },
    },
  },
  plugins: [],
};

export default config;

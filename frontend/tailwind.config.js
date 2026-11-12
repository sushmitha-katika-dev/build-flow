/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      colors: {
        canvas: 'var(--bf-bg-canvas)',
        surface: 'var(--bf-bg-surface)',
        subtle: 'var(--bf-bg-subtle)',
        hairline: 'var(--bf-border)',
        ink: {
          DEFAULT: 'var(--bf-text-primary)',
          secondary: 'var(--bf-text-secondary)',
          muted: 'var(--bf-text-muted)',
        },
        brand: {
          DEFAULT: 'var(--bf-accent)',
          soft: 'var(--bf-accent-soft)',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 4px 12px -2px rgba(15, 23, 42, 0.07), 0 1px 3px rgba(15, 23, 42, 0.04)',
        popover: '0 10px 30px -8px rgba(15, 23, 42, 0.14), 0 2px 8px -2px rgba(15, 23, 42, 0.06)',
        modal: '0 20px 50px -12px rgba(15, 23, 42, 0.24)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'panel-in': {
          '0%': { opacity: '0', transform: 'translateY(6px) scale(0.985)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        'page-enter': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'drawer-right': {
          '0%': { opacity: '0.4', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 160ms cubic-bezier(0.16, 1, 0.3, 1)',
        'panel-in': 'panel-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'page-enter': 'page-enter 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'drawer-right': 'drawer-right 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        'toast-in': 'toast-in 180ms cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--color-bg-app)",
        surface: "var(--color-bg-card)",
        card: "var(--color-bg-card)",
        sidebar: "var(--color-bg-sidebar)",
        subtle: "var(--color-bg-subtle)",
        border: {
          DEFAULT: "var(--color-border)",
          subtle: "var(--color-border-subtle)",
        },
        text: {
          DEFAULT: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          muted: "var(--color-text-muted)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          hover: "var(--color-primary-hover)",
          accent: "var(--color-primary-accent)",
          soft: "var(--color-primary-soft)",
          selected: "var(--color-primary-selected)",
          light: "var(--color-primary-soft)",
        },
        secondary: {
          DEFAULT: "var(--color-secondary)",
          soft: "var(--color-secondary-soft)",
          light: "var(--color-secondary-soft)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          dark: "var(--color-success-dark)",
          soft: "var(--color-success-soft)",
          light: "var(--color-success-soft)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          dark: "var(--color-warning-dark)",
          soft: "var(--color-warning-soft)",
          light: "var(--color-warning-soft)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          dark: "var(--color-danger-dark)",
          soft: "var(--color-danger-soft)",
          light: "var(--color-danger-soft)",
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.04)',
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};

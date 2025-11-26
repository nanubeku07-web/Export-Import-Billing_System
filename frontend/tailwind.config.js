/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB', // Royal Blue
          dark: '#1E40AF',
          light: '#60A5FA',
        },
        secondary: {
          DEFAULT: '#475569', // Slate
          dark: '#334155',
          light: '#94A3B8',
        },
        accent: {
          DEFAULT: '#F59E0B', // Amber
          hover: '#D97706',
        },
        dark: {
          DEFAULT: '#111827', // Gray 900
          surface: '#1F2937', // Gray 800
        },
        light: {
          DEFAULT: '#F9FAFB', // Gray 50
          surface: '#FFFFFF',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
    },
  },
  plugins: [],
}

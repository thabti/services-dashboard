/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand Colors
        brand: {
          primary: '#0D363C',
          secondary: '#152F31',
          accent: '#D4AF37',
          success: '#E1FFC8',
          error: '#ef4444',
        },
        // Success Scale
        success: {
          50: '#E1FFC8',
          100: '#F1F6F8',
          500: '#4c6c5a',
          600: '#395917',
          700: '#2d4712',
        },
        // Warning Scale
        warning: {
          100: '#FEF3C7',
          600: '#D97706',
        },
        // Neutral Scale
        neutral: {
          50: '#f8f9fa',
          100: '#ececf0',
          200: '#e3e4ea',
          300: '#d9d9d9',
          400: '#9ca3af',
          500: '#858d9d',
          600: '#5e5f6d',
          900: '#121212',
        },
        // Text Colors
        text: {
          primary: '#0D363C',
          secondary: '#5e5f6d',
          muted: '#858d9d',
        },
        // Background
        background: '#f8f9fa',
        foreground: '#0D363C',
      },
      fontFamily: {
        sans: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
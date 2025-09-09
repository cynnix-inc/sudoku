/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e1effe',
          200: '#c3dffe',
          300: '#a6cefd',
          400: '#88befe',
          500: '#6aaefe',
          600: '#4c9efc',
          700: '#2e8efb',
          800: '#0f7efa',
          900: '#0a64c8',
        },
        surface: {
          DEFAULT: '#ffffff',
          dark: '#0f1115',
        },
      },
      spacing: {
        1: '4px',
        2: '8px',
        3: '12px',
        4: '16px',
        6: '24px',
        8: '32px',
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '12px',
      },
    },
  },
  plugins: [],
};

import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Trung tính ngả xanh biển: thay "stone" mặc định để cả app mang tông đại dương
        stone: {
          50: '#f1f7f8',
          100: '#e2eef1',
          200: '#c8dce1',
          300: '#a3c1c8',
          400: '#74989f',
          500: '#4c737c',
          600: '#3c5f68',
          700: '#2e4b53',
          800: '#183846',
          900: '#0c2733',
          950: '#04161f',
        },
        brand: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [typography],
};

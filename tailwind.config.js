import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Trung tính "sương núi" ngả xanh thiên thanh: thay "stone" mặc định để cả app mang tông tiên giới
        stone: {
          50: '#f3f6fa',
          100: '#e6ecf3',
          200: '#cfd9e5',
          300: '#aebccd',
          400: '#8395aa',
          500: '#5b6d83',
          600: '#48586c',
          700: '#38455a',
          800: '#262f40',
          900: '#171e2c',
          950: '#0d121c',
        },
        // Ngọc bích
        brand: {
          50: '#effaf6',
          100: '#d3f1e6',
          200: '#a6e2cd',
          400: '#3fb894',
          500: '#22a07d',
          600: '#178568',
          700: '#136b55',
          800: '#125545',
          900: '#10463a',
        },
        // Vàng kim
        kim: {
          100: '#f8efd2',
          200: '#f0dea4',
          300: '#e6c977',
          400: '#d6b04f',
          500: '#bf9536',
          600: '#9c7626',
          700: '#79591a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['"Noto Serif"', 'Georgia', '"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [typography],
};

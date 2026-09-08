/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f6ff',
          100: '#e0edff',
          200: '#c7ddfe',
          300: '#9ec4fd',
          400: '#6ea0fb',
          500: '#3b78f6',
          600: '#1d55ed',
          700: '#1e40af',
          800: '#1e3a8a',
          900: '#172554',
          950: '#0c1a3b',
        },
        navy: {
          50: '#f4f6fb',
          100: '#e8ecf6',
          200: '#ccd7ed',
          300: '#a3b8dc',
          400: '#7394c8',
          500: '#5075b3',
          600: '#3c5c99',
          700: '#2d4474',
          800: '#1b2a4a',
          900: '#0f172a',
          950: '#0a1020',
        },
        saffron: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card-hover': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'glass': '0 8px 32px 0 rgba(15, 23, 42, 0.08)',
      },
    },
  },
  plugins: [],
}

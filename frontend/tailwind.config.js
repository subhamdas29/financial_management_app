/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: '#F5C518',        // golden yellow from reference
        dark: {
          900: '#111111',
          800: '#1A1A1A',
          700: '#222222',
          600: '#2A2A2A',
          500: '#333333',
          400: '#3A3A3A',
        },
        surface: '#2A2A2A',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
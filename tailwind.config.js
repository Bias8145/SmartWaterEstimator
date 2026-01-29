// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Critical for manual theme toggling
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      borderRadius: {
        '4xl': '2rem', // Extra rounded for main containers
      }
    }
  },
  plugins: [],
};

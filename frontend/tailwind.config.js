/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // ← ОБЯЗАТЕЛЬНО!
  theme: {
    extend: {
      colors: {
        primary: '#7c3aed',
        secondary: '#22c55e',
      }
    },
  },
  plugins: [],
}
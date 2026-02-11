/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#779ECB', // Pastel Blue (Darker)
        'primary-light': '#AEC6CF', // Pastel Blue (Lighter)
        secondary: '#B0E0E6', // Powder Blue
        accent: '#FFB7B2', // Pastel Red/Pink
        dark: '#1F2937', // Gray 800
        light: '#F0F8FF', // Alice Blue
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

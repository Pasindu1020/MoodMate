/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        'neon-teal': '#4ECDC4',
        'neon-coral': '#FF6B6B',
        'neon-purple': '#9D50BB',
        'dark-bg': '#121212',
        'panel-bg': '#232323',
      },
    },
  },
  plugins: [],
}

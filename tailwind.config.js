/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#E1261C',
          'red-dark': '#B81E16',
          black: '#0A0A0A',
          yellow: '#F5A623',
        },
      },
    },
  },
  plugins: [],
}

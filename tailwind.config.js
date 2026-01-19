/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        kids: {
          pink: '#FFB6C1',
          yellow: '#FFF9A8',
          blue: '#A8D8FF',
          purple: '#E0BBE4',
          green: '#B4E7CE',
        },
      },
      borderRadius: {
        'kids': '1.5rem',
      },
      fontFamily: {
        'kids': ['"Comic Neue"', 'Quicksand', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

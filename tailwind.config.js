/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        bebas: ['"Bebas Neue"', 'cursive'],
        raleway: ['Raleway', 'sans-serif'],
        jaro: ['Jaro', 'cursive'],
        lubrifont: ['WDXL Lubrifont TC', 'sans-serif'],
        barrio: ['Barrio', 'normal'],
        rubik: ['Rubik', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

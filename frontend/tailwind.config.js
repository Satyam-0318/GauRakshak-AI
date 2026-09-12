/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dairyland: {
          dark: '#081f12',
          forest: '#0c2f1a',
          hunter: '#113e23',
          pasture: '#1b5632',
          lawn: '#4f7324',
          olive: '#5f872d',
          cream: '#faecc4',
          creambg: '#fdf9ee',
          creamborder: '#e8dcba',
          softcream: '#fffdf5',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
        serif: ['Fraunces', 'Playfair Display', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

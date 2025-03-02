/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './nuxt.config.{js,ts}',
    './app.vue',
  ],
  theme: {
    colors: {
      blue: '#1a1625',
      beige: '#2f2b3a',
      grey: '#ECE8DD',
      paper: '#121212',
      paperlight: '#2f2b3a',
      paperlighter: '#FFFDF8',
      greyblue: '#AEBDCA',
      darkblue: '#5e43f3'
    },
    extend: {},
  },
  plugins: [],
}

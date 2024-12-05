/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {},
    colors: {
      lightBackground: 'var(--Very-Light-Gray)',
      light: 'var(--White)',
      lightText: 'var(--Very-Dark-text)',
      darkBackground: 'var(--Very-Dark-Blue)',
      dark: 'var(--Dark-Blue)',
    },
  },
  plugins: [],
}


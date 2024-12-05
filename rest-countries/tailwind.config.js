/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
    colors:{
      'lightBackground': 'var(--Very-Light-Gray)',
      'darkBackground': 'var( --Very-Dark-Blue)',
      'light': 'var( --White)',
      'dark':'var(--Very-Dark-Blue)',
      'light-elements': 'var(--White)',
      'dark-elements': 'var(--Dark-Blue)',
    }
  },
  plugins: [],
}


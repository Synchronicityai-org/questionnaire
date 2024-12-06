/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'very-dark-desaturated-blue': 'var(--Very-Dark-Desaturated-Blue)',
        'very-light-gray': 'var(--Very-Light-Gray)',
        'light-grayish-blue': 'var(--Light-Grayish-Blue)',
        'very-light-grayish-blue': 'var(--Very-Light-Grayish-Blue)',
        'dark-grayish-blue' : 'var(--Dark-Grayish-Blue)',
      },
      backgroundImage: {
       'check-combined': "url('./src/assets/icon-check.svg'),linear-gradient(to right, hsl(192, 100%, 67%) ,hsl(280, 87%, 65%))",
      },
    },
  },
  plugins: [],
}


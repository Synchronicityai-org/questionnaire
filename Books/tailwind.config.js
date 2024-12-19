/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        woodColor: 'var(--woodColor)',
        lightGray:'var(--lightGray)',
      },
      textShadow: {
        custom: '3px 2px 1px black', 
      },
      dropShadow:{
        'lg' : '3px 2px 1px #a7532d',
      },
      backgroundImage:{
        background:"url('/woodBackground.webp')",
        gradient:'var(--bookGradient)',
      }
    },
  },
  plugins: [
    require('tailwindcss-textshadow'),
  ],
}


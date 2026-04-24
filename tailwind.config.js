/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1B211A',
        secondary: '#628141',
        accent: '#8BAE66',
        neutral: '#EBD5AB',
      },
    },
  },
  plugins: [],
}


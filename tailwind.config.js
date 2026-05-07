/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas:          '#fdfcfc',
        ink:             '#201d1d',
        'ink-deep':      '#0f0000',
        'surface-soft':  '#f8f7f7',
        'surface-card':  '#f1eeee',
        'body-text':     '#424245',
        mute:            '#646262',
        ash:             '#9a9898',
        accent:          '#007aff',
        danger:          '#ff3b30',
        success:         '#30d158',
        warning:         '#ff9f0a',
      },
    },
  },
  plugins: [],
}

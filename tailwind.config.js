/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink:          '#080808',
        paper:        '#faf8f4',
        'paper-card': '#ffffff',
        gold:         '#c8a97e',
        'ink-text':   '#1a1614',
        'ink-muted':  '#7a6f6a',
        // Keep original tokens — used by LaTeX template previews
        primary:   '#1B211A',
        secondary: '#628141',
        accent:    '#8BAE66',
        neutral:   '#EBD5AB',
      },
    },
  },
  plugins: [],
}


import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'qc-bg': '#08090C',
        'qc-panel': '#111318',
        'qc-border': '#23262D',
        'qc-primary': '#7C5CFF',
        'qc-secondary': '#00D4FF',
        'qc-success': '#22C55E',
        'qc-warning': '#F59E0B',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
      },
    },
  },
  plugins: [],
};

export default config;

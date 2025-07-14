/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './styles/**/*.{js,ts,jsx,tsx,mdx,css}',
  ],
  theme: {
    extend: {
      colors: {
        cream: '#f8f8f0',
        'cream-10': 'rgba(248, 248, 240, 0.1)',
        'cream-20': 'rgba(248, 248, 240, 0.2)',
        'cream-30': 'rgba(248, 248, 240, 0.3)',
        'cream-40': 'rgba(248, 248, 240, 0.4)',
        'cream-50': 'rgba(248, 248, 240, 0.5)',
        'cream-60': 'rgba(248, 248, 240, 0.6)',
        'cream-80': 'rgba(248, 248, 240, 0.8)',
      },
    },
  },
  plugins: [],
} 
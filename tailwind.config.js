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
        cream: '#f5f5dc',
        'cream-10': 'rgba(245, 245, 220, 0.1)',
        'cream-20': 'rgba(245, 245, 220, 0.2)',
        'cream-30': 'rgba(245, 245, 220, 0.3)',
        'cream-40': 'rgba(245, 245, 220, 0.4)',
        'cream-50': 'rgba(245, 245, 220, 0.5)',
        'cream-60': 'rgba(245, 245, 220, 0.6)',
        'cream-80': 'rgba(245, 245, 220, 0.8)',
      },
    },
  },
  plugins: [],
} 
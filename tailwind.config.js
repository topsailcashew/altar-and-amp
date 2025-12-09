const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gray-950': '#0A0A0A',
        'accent-orange': '#FF4D00',
        'accent-blue': '#007BFF',
        'accent-green': '#00FF7F',
        'accent-purple': '#8A2BE2',
        // New gradient colors
        'blue-900': '#1e3a8a',
        'violet-700': '#6d28d9',
        'purple-700': '#7e22ce',
        'pink-600': '#db2777',
        'orange-600': '#ea580c',
        'red-600': '#dc2626',
        'green-500': '#22c55e',
        'teal-500': '#14b8a6',
      },
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        '6xl': '3rem',
      },
      keyframes: {
        'sound-wave': {
          '0%, 100%': { height: '25%' },
          '50%': { height: '100%' },
        },
        'gradient-shift': {
          '0%, 100%': { transform: 'translate(0%, 0%) scale(1)' },
          '50%': { transform: 'translate(5%, 5%) scale(1.1)' },
        },
        'border-pulse': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(147, 197, 253, 0.7)' },
          '50%': { boxShadow: '0 0 0 8px rgba(147, 197, 253, 0)' },
        },
      },
      animation: {
        'sound-wave': 'sound-wave 1.2s infinite ease-in-out',
        'gradient-shift': 'gradient-shift 15s ease infinite',
        'border-pulse': 'border-pulse 2s ease infinite',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate')
  ],
}
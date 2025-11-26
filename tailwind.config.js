module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'royal-blue': {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#1e3a8a', // Azul rey principal
          600: '#1e40af',
          700: '#1d4ed8',
          800: '#1e3a8a',
          900: '#1e3a8a',
        },
        'brown': {
          50: '#fdf8f6',
          100: '#f2e8e5',
          200: '#eaddd7',
          300: '#e0cec7',
          400: '#d2bab0',
          500: '#8B4513', // Rojo café principal
          600: '#a0522d', // Más vibrante
          700: '#8b4513', // Original
          800: '#5d2308',
          900: '#4a1c06',
        },
        'red': {
          500: '#dc2626',
          600: '#dc2626',
          700: '#b91c1c',
        }
      },
      animation: {
        'pulse': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
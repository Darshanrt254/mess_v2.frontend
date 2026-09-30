/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: '#FFD93D',
          darkGreen: '#1B5E20',
          green: '#2E7D32',
          greenLight: '#4CAF50',
          greenPale: '#A5D6A7',
          orange: '#FF8C00',
          orangeLight: '#FFB347',
          cream: '#FFF8E1',
          creamLight: '#FFFDE7',
          muted: '#8D99AE',
          surface: '#FFFBF0',
          card: '#FFF8E1',
          border: '#FF8C00',
        },
      },
      fontFamily: {
        nunito: ['Nunito', 'sans-serif'],
      },
      boxShadow: {
        'brand': '0 4px 16px rgba(255, 140, 0, 0.35)',
        'brand-lg': '0 8px 28px rgba(255, 140, 0, 0.45)',
        'brand-green': '0 6px 20px rgba(27, 94, 32, 0.35)',
        'subtle': '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'brand': '18px',
        'brand-sm': '10px',
      },
      borderWidth: {
        '3': '3px',
        '2.5': '2.5px',
      },
    },
  },
  plugins: [],
};

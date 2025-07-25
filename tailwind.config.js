/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Direct color references for easy use
        primary: '#F9D769', 
        secondary: '#734D20',  
        
        // Extended primary scale for more options
        'primary-scale': {
          50: '#FEF7E6',
          100: '#FDECC0',
          200: '#FCE099',
          300: '#FBD472',
          400: '#F9D769',  // Main
          500: '#E8C547',
          600: '#D4B332',
          700: '#B8981F',
          800: '#9C7E0F',
          900: '#734D20',  // Secondary
          950: '#5A3C19',
        },
        
        // Extended secondary scale for more options
        'secondary-scale': {
          50: '#F7F3ED',
          100: '#EDE4D3',
          200: '#DBC9A7',
          300: '#C9AE7B',
          400: '#734D20',  // Main
          500: '#654218',
          600: '#573716',
          700: '#492C14',
          800: '#3B2212',
          900: '#2D1A0F',
          950: '#1F110A',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #F9D769 0%, #E8C547 50%, #734D20 100%)',
        'gradient-primary-soft': 'linear-gradient(135deg, #F9D769 0%, #E8C547 100%)',
        'gradient-primary-dark': 'linear-gradient(135deg, #734D20 0%, #5A3C19 100%)',
        'gradient-primary-reverse': 'linear-gradient(135deg, #734D20 0%, #E8C547 50%, #F9D769 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #734D20 0%, #654218 50%, #2D1A0F 100%)',
        'gradient-secondary-soft': 'linear-gradient(135deg, #734D20 0%, #654218 100%)',
      },
      animation: {
        'skew-scroll': 'skew-scroll 20s linear infinite',
      },
      keyframes: {
        'skew-scroll': {
          '0%': {
            transform: 'rotateX(20deg) rotateZ(-20deg) skewX(20deg) translateZ(0) translateY(0)',
          },
          '100%': {
            transform: 'rotateX(20deg) rotateZ(-20deg) skewX(20deg) translateZ(0) translateY(-100%)',
          },
        },
      },
      gridTemplateColumns: {
        '10': 'repeat(10, minmax(0, 1fr))',
      },
      gridColumn: {
        'span-7': 'span 7 / span 7',
        'span-3': 'span 3 / span 3',
      },
    },
  },
  plugins: [],
}
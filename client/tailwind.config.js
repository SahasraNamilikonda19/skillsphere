/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        secondary: {
          50:  '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
        },
        accent: {
          50:  '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        success: {
          50:  '#f0fdf4',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        warning: {
          50:  '#fefce8',
          400: '#facc15',
          500: '#eab308',
          600: '#ca8a04',
        }
      },
      fontFamily: {
        sans:    ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'soft':    '0 2px 15px -3px rgba(0,0,0,0.07), 0 10px 20px -2px rgba(0,0,0,0.04)',
        'medium':  '0 4px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        'colored': '0 4px 20px -2px rgba(14,165,233,0.3)',
        'purple':  '0 4px 20px -2px rgba(217,70,239,0.3)',
        'orange':  '0 4px 20px -2px rgba(249,115,22,0.3)',
      },
      animation: {
        'fade-in':     'fadeIn 0.5s ease-in-out',
        'slide-up':    'slideUp 0.4s ease-out',
        'slide-down':  'slideDown 0.4s ease-out',
        'bounce-soft': 'bounceSoft 2s infinite',
        'pulse-soft':  'pulseSoft 2s infinite',
        'shimmer':     'shimmer 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        slideDown: {
          '0%':   { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',      opacity: '1' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-5px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.7' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backgroundImage: {
        'gradient-radial':  'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero':    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-card':    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-success': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'gradient-warm':    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'gradient-cool':    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        'gradient-dark':    'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)',
      }
    },
  },
  plugins: [],
}
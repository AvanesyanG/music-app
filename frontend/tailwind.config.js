/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern: /bg-.*/, // Match any bg- class
    },
    {
      pattern: /from-.*/, // Match any from- class
    },
    {
      pattern: /via-.*/, // Match any via- class
    },
    {
      pattern: /to-.*/, // Match any to- class
    },
    'bg-gradient-to-b' // Explicitly include gradient direction
  ],
  theme: {
    extend: {
      keyframes: {
        'slide-left-in': {
          '0%': { 
            transform: 'translateX(100%)',
            opacity: '0'
          },
          '100%': { 
            transform: 'translateX(0)',
            opacity: '1'
          }
        },
        'slide-left-out': {
          '0%': { 
            transform: 'translateX(0)',
            opacity: '1'
          },
          '100%': { 
            transform: 'translateX(-100%)',
            opacity: '0'
          }
        },
        'slide-right-in': {
          '0%': { 
            transform: 'translateX(-100%)',
            opacity: '0'
          },
          '100%': { 
            transform: 'translateX(0)',
            opacity: '1'
          }
        },
        'slide-right-out': {
          '0%': { 
            transform: 'translateX(0)',
            opacity: '1'
          },
          '100%': { 
            transform: 'translateX(100%)',
            opacity: '0'
          }
        }
      },
      animation: {
        'slide-left-in': 'slide-left-in 250ms cubic-bezier(0.2, 0, 0, 1) forwards',
        'slide-left-out': 'slide-left-out 250ms cubic-bezier(0.2, 0, 0, 1) forwards',
        'slide-right-in': 'slide-right-in 250ms cubic-bezier(0.2, 0, 0, 1) forwards',
        'slide-right-out': 'slide-right-out 250ms cubic-bezier(0.2, 0, 0, 1) forwards'
      },
      screens: {
        'lg-sidebar': '1100px',
      },
      height: {
        '100dvh': '100dvh',
      },
    },
  },
  plugins: [],
}
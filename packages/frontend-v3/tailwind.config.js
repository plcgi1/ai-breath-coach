/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{svelte,js,ts}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif']
      },
      colors: {
        tg: {
          bg: 'var(--tg-theme-bg-color)',
          text: 'var(--tg-theme-text-color)',
          hint: 'var(--tg-theme-hint-color)',
          link: 'var(--tg-theme-link-color)',
          button: 'var(--tg-theme-button-color)',
          'button-text': 'var(--tg-theme-button-text-color)',
          'secondary-bg': 'var(--tg-theme-secondary-bg-color)'
        }
      },
      animation: {
        'breathe-in': 'breatheIn var(--inhale-duration) ease-in-out forwards',
        'breathe-out': 'breatheOut var(--exhale-duration) ease-in-out forwards',
        'pulse-ring': 'pulseRing 2s ease-out infinite',
        'fire-glow': 'fireGlow 1s ease-in-out infinite alternate'
      },
      keyframes: {
        breatheIn: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.4)' }
        },
        breatheOut: {
          '0%': { transform: 'scale(1.4)' },
          '100%': { transform: 'scale(1)' }
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.6' },
          '100%': { transform: 'scale(1.8)', opacity: '0' }
        },
        fireGlow: {
          'from': { filter: 'brightness(1)' },
          'to': { filter: 'brightness(1.3)' }
        }
      }
    }
  },
  plugins: []
}

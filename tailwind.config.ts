import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        poison: {
          500: '#8A2BE2',
          700: '#7A1FD1',
          900: '#5D17A0',
        },
      },
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,0.35)',
        cardHover: '0 12px 32px rgba(0,0,0,0.45)',
        glow: '0 0 0 2px rgba(138,43,226,0.25), 0 10px 30px rgba(138,43,226,0.15)'
      },
      animation: {
        throb: 'throb 1.5s ease-in-out infinite',
      },
      keyframes: {
        throb: {
          '0%, 100%': { transform: 'scaleX(1)' },
          '50%': { transform: 'scaleX(1.03)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config

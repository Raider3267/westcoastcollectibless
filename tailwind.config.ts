import type { Config } from 'tailwindcss'

const accentBg10 = [
  'bg-pop-pink/10','bg-pop-orange/10','bg-pop-yellow/10',
  'bg-pop-lime/10','bg-pop-teal/10','bg-pop-blue/10','bg-pop-purple/10',
]
const accentBg15 = [
  'bg-pop-pink/15','bg-pop-orange/15','bg-pop-teal/15',
]
const accentText = [
  'text-pop-pink','text-pop-orange','text-pop-yellow',
  'text-pop-lime','text-pop-teal','text-pop-blue','text-pop-purple',
]

export default {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  safelist: [...accentBg10, ...accentBg15, ...accentText],
  theme: {
    extend: {
      colors: {
        pop: {
          pink: '#FF5DA2',
          orange: '#FF9F1C',
          yellow: '#FFD166',
          lime: '#7AE582',
          teal: '#2EC4B6',
          blue: '#5CABFF',
          purple: '#9B5DE5',
        },
      },
      boxShadow: {
        pop: '0 10px 25px -10px rgba(0,0,0,0.15)',
      },
      borderRadius: {
        card: '1.6rem',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'gradient-x': 'gradient-x 12s ease infinite',
        float: 'float 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config

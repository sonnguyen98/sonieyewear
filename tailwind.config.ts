import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-be-vietnam)', 'sans-serif'],
      },
      colors: {
        brand: {
          black:  '#0D0D0D',
          white:  '#FAFAFA',
          gold:   '#D4A853',
          zalo:   '#0068FF',
          muted:  '#4B5563',
          light:  '#F5F5F5',
          border: '#E5E7EB',
        },
      },
      fontSize: {
        'display-xl': ['clamp(2.5rem,8vw,5.5rem)', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-lg': ['clamp(1.75rem,5vw,3rem)',  { lineHeight: '1.1',  letterSpacing: '-0.02em' }],
        'display-md': ['clamp(1.25rem,3vw,2rem)',  { lineHeight: '1.2',  letterSpacing: '-0.01em' }],
      },
      screens: {
        xs: '375px',
      },
      keyframes: {
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseZalo: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,104,255,0.4)' },
          '50%':      { boxShadow: '0 0 0 12px rgba(0,104,255,0)' },
        },
        pulseChat: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(13,13,13,0.3)' },
          '50%':      { boxShadow: '0 0 0 10px rgba(13,13,13,0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'slide-up':   'slideUp 0.4s ease-out',
        'fade-in':    'fadeIn 0.3s ease-out',
        'pulse-zalo': 'pulseZalo 2s infinite',
        'pulse-chat': 'pulseChat 2s infinite',
        shimmer:      'shimmer 1.4s infinite linear',
      },
    },
  },
  plugins: [],
}

export default config

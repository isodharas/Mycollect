import type { Config } from 'tailwindcss'
const config: Config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Noto Sans Sinhala', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        sky:   { 50:'#EEF6FC', 100:'#D1E9FA', 200:'#A8D4F5', 300:'#7BBDE8', 400:'#2E86C1', 500:'#1A5276' },
        green: { 50:'#EDF7F1', 100:'#C8E6D5', 200:'#91CDA9', 300:'#4CAF72', 400:'#2D7A4F', 500:'#1A3328' },
        sand:  { 50:'#FDFAF4', 100:'#F5EDD8', 200:'#E6D3A3' },
        ink:   { 50:'#F0F8FF', 100:'#C9DFE8', 200:'#5B8FA8', 300:'#2E5266', 400:'#0F2A3D' },
      },
      borderRadius: {
        lg: '12px', xl: '16px', '2xl': '20px', '3xl': '24px',
      },
      backdropBlur: {
        xs: '4px', sm: '8px', md: '16px', lg: '24px', xl: '32px',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(15,42,61,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
        'glass-lg': '0 16px 48px rgba(15,42,61,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
        'glass-sm': '0 4px 16px rgba(15,42,61,0.06), inset 0 1px 0 rgba(255,255,255,0.7)',
        card: '0 4px 24px rgba(15,42,61,0.07)',
        'card-hover': '0 16px 48px rgba(15,42,61,0.12)',
      },
      animation: {
        'fade-up': 'fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease',
        'blink': 'blink 2s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'ticker': 'ticker 32s linear infinite',
      },
      keyframes: {
        fadeUp:  { from:{opacity:'0',transform:'translateY(16px)'}, to:{opacity:'1',transform:'translateY(0)'} },
        fadeIn:  { from:{opacity:'0'}, to:{opacity:'1'} },
        blink:   { '0%,100%':{opacity:'1'}, '50%':{opacity:'0.2'} },
        float:   { '0%,100%':{transform:'translateY(0)'}, '50%':{transform:'translateY(-8px)'} },
        ticker:  { from:{transform:'translateX(0)'}, to:{transform:'translateX(-50%)'} },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
export default config

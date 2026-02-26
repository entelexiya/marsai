/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['Space Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      colors: {
        mars: {
          red: '#FF4500',
          orange: '#FF6B35',
          glow: '#FF8C42',
        },
        space: {
          dark: '#020308',
          deep: '#050A14',
          navy: '#0A1628',
          card: '#0D1B2A',
          border: '#1A2B3C',
        },
        neon: {
          blue: '#00D4FF',
          green: '#00FF94',
          yellow: '#FFD700',
          red: '#FF4444',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'data-flow': 'dataflow 1.5s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'star-twinkle': 'twinkle 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' },
        },
        dataflow: {
          '0%': { opacity: 0, transform: 'translateX(0)' },
          '50%': { opacity: 1 },
          '100%': { opacity: 0, transform: 'translateX(20px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px #FF4500, 0 0 10px #FF4500' },
          '100%': { boxShadow: '0 0 20px #FF4500, 0 0 40px #FF4500, 0 0 60px #FF450044' },
        },
        twinkle: {
          '0%, 100%': { opacity: 0.3 },
          '50%': { opacity: 1 },
        }
      },
      backgroundImage: {
        'mars-gradient': 'radial-gradient(ellipse at 70% 50%, #FF450015 0%, transparent 60%)',
        'earth-gradient': 'radial-gradient(ellipse at 30% 50%, #00D4FF10 0%, transparent 60%)',
      }
    },
  },
  plugins: [],
}

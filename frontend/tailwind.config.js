/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#635bff',
          dark: '#4b45c6',
          light: '#7b79ff',
        },
        gold: {
          DEFAULT: '#d8a84e',
          300: '#e5c04a',
          400: '#c9a227',
          500: '#a88620',
        },
        dark: {
          DEFAULT: '#0b1020',
          100: '#0f1625',
          200: '#141c30',
          300: '#1a2440',
        },
        gray: {
          50: '#f6f9fc',
          100: '#eef1f6',
          200: '#e3e8ee',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'fade-up': 'fadeUp 0.5s ease-out forwards',
        'float-slow': 'float 9s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-14px)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
      },
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(60, 66, 87, 0.05), 0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(60, 66, 87, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'lg': '0 10px 15px -3px rgba(60, 66, 87, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.04)',
        'glow': '0 4px 16px rgba(99, 91, 255, 0.25)',
      },
    },
  },
  plugins: [],
}

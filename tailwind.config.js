/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        cad: {
          darkest: '#090d16',
          darker: '#0b1120',
          dark: '#0f172a',
          panel: '#151f32',
          surface: '#1e293b',
          border: '#334155',
          muted: '#64748b',
          light: '#cbd5e1',
          highlight: '#f8fafc',
        },
        gold: {
          DEFAULT: '#d97706',
          bright: '#f59e0b',
          glow: '#fde68a',
          dark: '#92400e',
        },
        terracotta: {
          DEFAULT: '#c2410c',
          light: '#ea580c',
          dark: '#9a3412',
        },
        blueprint: {
          DEFAULT: '#0284c7',
          light: '#38bdf8',
          dark: '#0369a1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Space Mono"', 'monospace'],
      },
      boxShadow: {
        'cad': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'panel': '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'gold-glow': '0 0 15px rgba(245, 158, 11, 0.3)',
      },
    },
  },
  plugins: [],
}

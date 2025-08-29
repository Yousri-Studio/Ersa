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
        'handicrafts': ['"The Year of Handicrafts"', 'serif'],
        'cairo': ['var(--font-cairo)', 'Cairo', 'sans-serif'],
        'sans': ['var(--font-cairo)', 'Cairo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'serif': ['var(--font-cairo)', 'Cairo', 'ui-serif', 'Georgia', 'serif'],
        'mono': ['var(--font-cairo)', 'Cairo', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        primary: {
          50: '#f0fdfa',
          100: '#ccfbf1',
          200: '#99f6e4',
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
          600: '#00AC96',
          700: '#0f766e',
          800: '#115e59',
          900: '#134e4a',
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
      },
      backgroundImage: {
        'gradient-text': 'linear-gradient(270deg, #00AC96 31.94%, #693EB0 59.68%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Playfair Display', 'Georgia', 'serif'],
        sans: ['Inter', 'Prompt', 'system-ui', 'sans-serif'],
        thai: ['Prompt', 'sans-serif'],
        heading: ['Kanit', 'sans-serif'],
      },
      colors: {
        cream: '#EDE9E6',
        terracotta: '#C9996B',
        brown: '#5C4F4A',
        sage: '#5C766D',
        // Neutral surface shades used throughout section backgrounds/borders
        linen: '#F5F3F0',
        sand: '#E0DCD7',
        pebble: '#D4D0CB',
      },
    },
  },
  plugins: [],
};
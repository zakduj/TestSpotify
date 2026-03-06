import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/components/**/*.{vue,js,ts}',
    './src/layouts/**/*.vue',
    './src/pages/**/*.vue',
    './src/app.vue',
    './src/error.vue'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef9f2',
          100: '#d6f1df',
          500: '#1db954',
          600: '#18a449',
          700: '#12853a'
        }
      }
    }
  },
  plugins: []
} satisfies Config;


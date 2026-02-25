import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: ['class', '.dark'],
  theme: {
    extend: {
      screens: { xs: '375px' },
    },
  },
  plugins: [],
};
export default config;

import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'gs-blue': '#4285F4',
        'gs-bg': '#F1F3F4',
        'gs-border': '#DADCE0',
        'gs-text': '#3C4043',
        'gs-text-secondary': '#5F6368',
        'gs-hover': '#F1F3F4',
        'gs-toolbar': '#EDF2FA',
      },
      fontSize: {
        'toolbar': '12px',
        'menu': '13px',
      },
    },
  },
  plugins: [],
};
export default config;

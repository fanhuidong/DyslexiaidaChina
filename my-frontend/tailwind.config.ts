import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Understood.org 配色系统
        navy: {
          DEFAULT: '#122C49',
          dark: '#000033',
        },
        primary: {
          DEFAULT: '#5C4AE4',
          hover: '#4838b9',
          light: '#7c6ee8',
          dark: '#3d2f9e',
        },
        mint: {
          DEFAULT: '#A5DCC7',
          dark: '#7BC4A8',
        },
        coral: {
          DEFAULT: '#F59288',
          dark: '#E87A6E',
        },
        'off-white': '#F4F3F1',
        'surface': '#FFFFFF',
        'text-primary': '#122C49',
        'text-secondary': '#475569',
        'text-muted': '#64748B',
      },
      fontFamily: {
        sans: ['var(--font-lexend)', 'Lexend', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      lineHeight: {
        'dyslexia': '1.7', // 阅读障碍友好的行高
        'dyslexia-tight': '1.6',
        'dyslexia-loose': '1.8',
      },
      letterSpacing: {
        'dyslexia': '0.01em',
        'dyslexia-wide': '0.02em',
      },
      borderRadius: {
        'card': '1rem', // 16px
        'card-large': '1.5rem', // 24px
      },
      spacing: {
        'section': '5rem', // 80px - 模块间距
        'section-lg': '7.5rem', // 120px - 大模块间距
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
};
export default config;
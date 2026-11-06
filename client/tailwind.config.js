/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        app: '#F6F4EF',
        sidebar: '#EFEBE3',
        card: '#FFFFFF',
        surface: '#FFFFFF',
        hover: '#F1EEE6',
        input: '#FFFFFF',
        line: {
          DEFAULT: '#E2DDD2',
          strong: '#CFC8B8',
        },
        ink: {
          DEFAULT: '#1C2321',
          secondary: '#5B6663',
          muted: '#8A938F',
        },
        brand: {
          DEFAULT: '#0F766E',
          hover: '#115E59',
          soft: '#D9EFEA',
          on: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#C2410C',
          soft: '#FCE9DD',
        },
        success: {
          DEFAULT: '#2F855A',
          soft: '#DDF1E6',
        },
        warning: {
          DEFAULT: '#9A6700',
          soft: '#FFF1CC',
        },
        danger: {
          DEFAULT: '#B42318',
          soft: '#FDE8E6',
        },
        info: {
          DEFAULT: '#2563A8',
          soft: '#E2EDF8',
        },
        ai: {
          DEFAULT: '#EEF5F2',
          border: '#BFDDD5',
        },
        workspace: {
          1: '#0F766E',
          2: '#C2410C',
          3: '#B7791F',
          4: '#2F6B4F',
          5: '#8B5E3C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#EEF1F7",
          100: "#DCE2EE",
          300: "#8C9BBE",
          500: "#3E5079",
          700: "#233A63",
          800: "#1B2A4A",
          900: "#121C33",
        },
        paper: {
          DEFAULT: "#FAF9F5",
          card: "#FFFFFF",
          line: "#E4E1D6",
        },
        brass: {
          DEFAULT: "#B8863F",
          light: "#D9AE6E",
          dark: "#8C6428",
        },
        sage: {
          DEFAULT: "#5B7B6B",
          light: "#8FAE9C",
        },
        rust: "#A6482F",
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        grid: "linear-gradient(#E4E1D6 1px, transparent 1px), linear-gradient(90deg, #E4E1D6 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

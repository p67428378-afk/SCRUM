/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#D97706",
          hover: "#B45309",
          active: "#92400E",
        },
        secondary: "#78716C",
        accent: "#B45309",
        surface: "#FFFFFF",
        background: "#FAFAFA",
      },
    },
  },
  plugins: [],
};

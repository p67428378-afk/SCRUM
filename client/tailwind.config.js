/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        portfolio: {
          bg: "#0A0E17",
          surface: "#0F131C",
          alt: "#181B25",
          gold: "#F59E0B",
          goldHover: "#D97706",
          text: "#F9FAFB",
          muted: "#9CA3AF",
        },
      },
      fontFamily: {
        serif: ['"Bodoni Moda"', "serif"],
        sans: ['"Manrope"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

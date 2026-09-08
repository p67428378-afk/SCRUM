/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          950: "#182442",
          900: "#1e2e54",
          800: "#273b6b",
          700: "#334c85",
          100: "#e9edf7",
          50: "#f4f6fb",
        },
        accent: {
          DEFAULT: "#ffbf00",
          hover: "#e6ac00",
          light: "#fff3cc",
        },
      },
      fontFamily: {
        serif: ["'Playfair Display'", "Georgia", "serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

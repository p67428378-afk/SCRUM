/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#EA580C",
        accent: "#0D9488",
        surface: "#FFFFFF",
        background: "#FAF7F2",
        text_primary: "#1F1712",
        text_secondary: "#7A7066",
        success: "#17A34A",
        warning: "#EAB308",
        error: "#DC2626",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#10b981",
        accent: "#38bdf8",
        surface: "#0a122a",
        background: "#0a122a",
        textPrimary: "#dbe1ff",
        textSecondary: "#bbcabf",
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

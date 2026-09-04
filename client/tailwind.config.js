/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        pvPrimary: "#1a98ff",
        pvAccent: "#a1c9ff",
        pvSurface: "#1e2020",
        pvBackground: "#121414",
        pvTextPrimary: "#e3e2e2",
        pvTextSecondary: "#bfc7d1",
        pvSuccess: "#4ade80",
        pvWarning: "#facc15",
        pvError: "#f87171",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

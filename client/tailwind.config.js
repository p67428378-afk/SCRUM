/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2563eb",
          dark: "#0053db",
          light: "#eff6ff",
        },
        surface: "#ffffff",
        background: "#f8f9ff",
        textPrimary: "#0b1c30",
        textSecondary: "#434655",
        success: "#047857",
        warning: "#b45309",
        error: "#be123c",
      },
      fontFamily: {
        sans: ["Geist", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

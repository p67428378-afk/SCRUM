/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2663EB",
          hover: "#1D4ED8",
          light: "#EFF6FF",
        },
        accent: "#17A34A",
        surface: "#FFFFFF",
        background: "#F7FAFC",
        textPrimary: "#171C29",
        textSecondary: "#707A8C",
        success: "#17A34A",
        warning: "#EB9917",
        error: "#DB2626",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

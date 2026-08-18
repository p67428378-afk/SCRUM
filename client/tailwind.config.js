/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2663eb",
        accent: "#eb9917",
        surface: "#ffffff",
        background: "#f7fafc",
        textPrimary: "#171c29",
        textSecondary: "#707a8c",
        success: "#17a34a",
        warning: "#eb9917",
        error: "#db2626",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#7A3BED",
        accent: "#21C45C",
        surface: "#1F1F2E",
        background: "#12121C",
        textPrimary: "#F5F5FA",
        textSecondary: "#9EA3B8",
        success: "#21C45C",
        warning: "#F5A826",
        error: "#DB2626",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

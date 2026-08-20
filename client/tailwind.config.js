/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2663EB",
        accent: "#2663EB",
        surface: "#FFFFFF",
        background: "#F7FAFC",
        textPrimary: "#171C29",
        textSecondary: "#707A8C",
        border: "#E3E8F0",
        success: "#17A34A",
        warning: "#EB9917",
        error: "#DC2626",
      },
    },
  },
  plugins: [],
};

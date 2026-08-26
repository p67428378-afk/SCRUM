/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2663EB",
        secondary: "#17A34A",
        accent: "#EB9917",
        background: "#F7FAFC",
        surface: "#FFFFFF",
        inputBg: "#F2F5FA",
        textPrimary: "#171C29",
        textMuted: "#707A8C",
        border: "#E3E8F0",
        success: "#17A34A",
        warning: "#EB9917",
        error: "#DC2626",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

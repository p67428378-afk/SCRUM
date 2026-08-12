/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2663eb",
        accent: "#eb9917",
        surface: "#ffffff",
        inputBg: "#f2f5fa",
        textPrimary: "#171c29",
        textSecondary: "#707a8c",
        muted: "#707a8c",
        border: "#e3e8f0",
        success: "#17a34a",
        warning: "#eb9917",
        error: "#db2626",
      },
    },
  },
  plugins: [],
};

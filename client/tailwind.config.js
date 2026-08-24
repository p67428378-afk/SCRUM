/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        temple: {
          primary: "#B45309",
          accent: "#F59E0B",
          surface: "#FFFFFF",
          bg: "#FDFBF7",
          dark: "#1F2937",
          muted: "#6B7280",
          border: "#E5E7EB",
          success: "#17A34A",
        },
      },
    },
  },
  plugins: [],
};

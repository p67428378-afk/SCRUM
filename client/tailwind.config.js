/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        tea: {
          50: "#f2f9f4",
          100: "#e1f2e5",
          200: "#c5e5cd",
          300: "#9bcfaa",
          400: "#6bb381",
          500: "#46965f",
          600: "#1a7644", // primary
          700: "#2a6941",
          800: "#245436",
          900: "#1f452e",
        },
      },
    },
  },
  plugins: [],
};

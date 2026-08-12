/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2663EB",
        accent: "#17A34A",
        surface: "#FFFFFF",
        background: "#F7FAFC",
      },
    },
  },
  plugins: [],
};

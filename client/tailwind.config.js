/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0F172A",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#3B82F6",
          foreground: "#FFFFFF",
        },
        accent: "#2563EB",
      },
    },
  },
  plugins: [],
};

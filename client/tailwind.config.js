/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        emerald: {
          400: "#00D68F",
          500: "#10B981",
          600: "#059669",
        },
      },
    },
  },
  plugins: [],
};

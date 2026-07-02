/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dg: {
          yellow: "#FFD100", // Dollar General Yellow
          dark: "#1E1E1E",
        },
      },
    },
  },
  plugins: [],
};

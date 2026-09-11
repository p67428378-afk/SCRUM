/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#0F52BA",
          accent: "#0D9488",
        },
      },
    },
  },
  plugins: [],
};

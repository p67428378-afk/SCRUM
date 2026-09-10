/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dg: {
          yellow: "#ECC000",
          yellowDark: "#D4AC00",
          black: "#111827",
          gray: "#F8FAFC",
        },
      },
    },
  },
  plugins: [],
};

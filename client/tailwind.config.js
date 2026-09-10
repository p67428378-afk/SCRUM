/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0c2340",
          secondary: "#4338ca",
          primary: "#2563eb",
          accent: "#3b82f6",
        },
      },
      fontFamily: {
        sans: [
          '"Plus Jakarta Sans"',
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};

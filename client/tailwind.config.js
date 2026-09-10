/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        salon: {
          primary: "#5B1D2E",
          secondary: "#B87D7E",
          accent: "#F4EAE6",
          bg: "#FCF9F8",
          surface: "#FFFFFF",
          text: "#151C24",
          subtext: "#534345",
          success: "#2B5242",
          warning: "#9E6038",
          error: "#913330",
        },
      },
      fontFamily: {
        serif: ['"Playfair Display"', "serif"],
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};

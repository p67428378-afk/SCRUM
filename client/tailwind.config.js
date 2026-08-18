/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bakery: {
          primary: "#D96B1F",
          secondary: "#80756B",
          accent: "#EB9414",
          bg: "#FAF7F2",
          surface: "#FFFFFF",
          surfaceAlt: "#F5F2EB",
          textPrimary: "#1F1A14",
          textSecondary: "#80756B",
          border: "#E5DED1",
          success: "#1F9E4D",
          warning: "#EB9414",
          error: "#D92D2D",
        },
      },
    },
  },
  plugins: [],
};

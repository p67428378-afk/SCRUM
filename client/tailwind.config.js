/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#122338",
          dark: "#0a1420",
          light: "#1f3552",
        },
        secondary: {
          DEFAULT: "#0d6847",
          light: "#14865c",
        },
        accent: {
          DEFAULT: "#a12228",
          light: "#c22d34",
        },
        surface: "#ffffff",
        background: "#f9f9ff",
        textPrimary: "#111c2d",
        textSecondary: "#566070",
      },
      fontFamily: {
        serif: ["Newsreader", "Georgia", "serif"],
        sans: ["Plus Jakarta Sans", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

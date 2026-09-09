/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        actor: {
          primary: "#f2ca50",
          accent: "#d4af37",
          surface: "#111319",
          surfaceLight: "#1a1d26",
          bg: "#0b0e13",
          text: "#e1e2e9",
          textMuted: "#d0c5af",
          success: "#10b981",
          warning: "#ffb691",
          error: "#ffb4ab",
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', "Inter", "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
    },
  },
  plugins: [],
};

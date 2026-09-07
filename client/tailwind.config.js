/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#00D1FF",
        secondary: "#10B981",
        accent: "#4CDEFF",
        background: "#0B1326",
        surface: "#171F33",
        surfaceAlt: "#222A3D",
        textPrimary: "#DAE2FD",
        textSecondary: "#BBC9CF",
        borderDark: "#3C494E",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
    },
  },
  plugins: [],
};

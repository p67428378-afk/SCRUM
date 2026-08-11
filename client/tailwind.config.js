/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2663EB",
        secondary: "#707A8C",
        accent: "#2663EB",
        background: "#F7FAFC",
        surface: "#FFFFFF",
        "surface-alt": "#F2F5FA",
        "text-primary": "#171C29",
        "text-secondary": "#707A8C",
        border: "#E3E8F0",
        success: "#17A34A",
        warning: "#EB9917",
        error: "#DB2626",
      },
      borderRadius: {
        md: "8px",
      },
      boxShadow: {
        "elevation-2": "0 4px 12px rgba(0, 0, 0, 0.1)",
      },
    },
  },
  plugins: [],
};

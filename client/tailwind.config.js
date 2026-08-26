/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#2E4F3D",
          hover: "#243E30",
          light: "#EBF1ED",
        },
        accent: {
          DEFAULT: "#E08C1A",
          hover: "#C77912",
          light: "#FDF4E7",
        },
        surface: "#FFFFFF",
        bgsoft: "#F7F7F5",
        textmain: "#1F2624",
        textmuted: "#737A75",
        borderline: "#E0E3DE",
        success: "#268C4D",
        warning: "#E08C1A",
        danger: "#D12E2E",
      },
    },
  },
  plugins: [],
};

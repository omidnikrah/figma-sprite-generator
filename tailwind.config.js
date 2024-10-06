/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    colors: {
      black: "#1A1B20",
      white: "#FFFFFF",
      red: "db2f2f",
      transparent: "transparent",
    },
    extend: {
      animation: {
        rotation: "rotation 1s linear infinite",
      },
      keyframes: {
        rotation: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
    },
  },
  plugins: [],
  darkMode: ["class", ".figma-dark"],
};

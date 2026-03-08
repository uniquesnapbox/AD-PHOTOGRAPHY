/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#ffeaea",
          100: "#ffd5d5",
          200: "#ffaaaa",
          300: "#ff7f7f",
          400: "#f55353",
          500: "#e21b1b",
          600: "#c61414",
          700: "#9f1010",
          800: "#780c0c",
          900: "#560808",
        },
        accent: {
          100: "#fff5b8",
          200: "#ffeb70",
          300: "#ffdf3a",
          400: "#ffd400",
          500: "#e1ba00",
        },
        ink: "#111111",
      },
      boxShadow: {
        soft: "0 14px 34px -20px rgba(0, 0, 0, 0.35)",
      },
      backgroundImage: {
        mesh: "linear-gradient(135deg, rgba(0,0,0,0.86), rgba(0,0,0,0.58))",
      },
    },
  },
  plugins: [],
};

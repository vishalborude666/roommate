/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1C2321",       // near-black charcoal for text
        paper: "#F7F5EF",     // warm off-white background
        moss: {
          50: "#F1F5EE",
          100: "#DEE8D6",
          400: "#7C9A6E",
          500: "#5B7A4B",
          600: "#456138",
          700: "#344A2A",
        },
        clay: {
          400: "#E0A96D",
          500: "#D18C4A",
          600: "#B3713A",
        },
        slatex: {
          50: "#F4F6F7",
          100: "#E3E8EA",
          400: "#7C8B90",
          600: "#3F4A4D",
        },
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

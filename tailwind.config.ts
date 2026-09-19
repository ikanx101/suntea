import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        hotpink: {
          50: "#fff0f7",
          100: "#ffe0ef",
          200: "#ffb8dc",
          300: "#ff8ac6",
          400: "#ff5cae",
          500: "#ff2d96",
          600: "#ec1580",
          700: "#c60d68",
          800: "#9e0d54",
          900: "#7d0f46",
        },
        lavender: {
          50: "#f5f2ff",
          100: "#ebe4ff",
          200: "#d5c7ff",
          300: "#b8a2ff",
          400: "#9b7dff",
          500: "#8258f7",
          600: "#6c3ce0",
          700: "#582fb8",
          800: "#472691",
          900: "#3a2274",
        },
        coral: {
          50: "#fff4f0",
          100: "#ffe4da",
          200: "#ffc4ac",
          300: "#ff9d78",
          400: "#ff7a4d",
          500: "#fc5c2e",
          600: "#e8461a",
          700: "#c13615",
          800: "#9a2d17",
          900: "#7c2716",
        },
        mint: {
          50: "#eefdf6",
          100: "#d5fae8",
          200: "#adf3d3",
          300: "#78e6b8",
          400: "#43d199",
          500: "#22b880",
          600: "#169668",
          700: "#137856",
          800: "#125f46",
          900: "#104e3b",
        },
        cream: "#fffaf3",
      },
      fontFamily: {
        heading: ["var(--font-heading)"],
        body: ["var(--font-body)"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
export default config;

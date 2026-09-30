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
        // Warna utama aplikasi: turquoise.
        turquoise: {
          50: "#eefdfb",
          100: "#d3f9f4",
          200: "#a8f2e9",
          300: "#6ee5da",
          400: "#35cec3",
          500: "#17b3aa",
          600: "#0e918c",
          700: "#0f7471",
          800: "#115e5c",
          900: "#124d4c",
        },
        // Aksen cerah (gradien tombol utama, sorotan).
        aqua: {
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        // Warna pendukung untuk teks lembut, label, dan permukaan kartu.
        ocean: {
          50: "#f2f9fa",
          100: "#e0f1f4",
          200: "#c1e2e9",
          300: "#93cbd8",
          400: "#5ea9bd",
          500: "#3f8ba3",
          600: "#327187",
          700: "#2c5c6e",
          800: "#2a4d5c",
          900: "#27414e",
        },
        // Pemasukan / status positif.
        mint: {
          50: "#eefdf5",
          100: "#d4fae6",
          200: "#a8f3cd",
          300: "#6ee6b0",
          400: "#38d297",
          500: "#17b57d",
          600: "#0c9465",
          700: "#0b7653",
          800: "#0d5e44",
          900: "#0d4e3a",
        },
        // Pengeluaran / peringatan / tombol hapus.
        rose: {
          50: "#fff2f0",
          100: "#ffe3df",
          200: "#ffc8c0",
          300: "#ffa294",
          400: "#fb7563",
          500: "#ef4d3a",
          600: "#d93a28",
          700: "#b52e1f",
          800: "#932a1e",
          900: "#7a281f",
        },
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

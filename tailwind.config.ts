import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./context/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        pyne: {
          // Fondos oscuros
          black: "#0D0D0D",
          coal: "#121212",
          smoke: "#1A1A1A",
          border: "#2A2724",

          // Beige / Crema vintage
          cream: "#E5D9C5",
          kraft: "#D4C5A9",
          muted: "#8F8578",

          // Color de acento de marca elegido (#D3B896)
          orange: "#D3B896", // Beige/arena principal para la estrella ✦, botones y acentos
          ember: "#C0A380",  // Tono un poco más oscuro para hover y contrastes
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Impact", "Haettenschweiler", "sans-serif"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "pyne-grain":
          "radial-gradient(circle at 50% 0%, rgba(211,184,150,0.12), transparent 55%)",
      },
      boxShadow: {
        pyne: "0 8px 40px -12px rgba(211,184,150,0.25)",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideIn: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp .45s ease-out both",
        slideIn: "slideIn .3s cubic-bezier(.22,1,.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
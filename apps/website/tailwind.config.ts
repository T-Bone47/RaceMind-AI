import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        carbon: {
          DEFAULT: "#050608",
          light: "#0b0d12",
          lighter: "#13161c",
        },
        graphite: {
          DEFAULT: "#17191D",
          light: "#212429",
        },
        border: "#1f242e",
        electric: {
          DEFAULT: "#FF3300",
          dim: "#CC2900",
          glow: "rgba(255, 51, 0, 0.15)",
        },
        signal: {
          green: "#00FF66",
          amber: "#FFB020",
          red: "#FF3333",
        },
        ink: {
          primary: "#FFFFFF",
          secondary: "#A1A1AA",
          muted: "#71717A",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "'SFMono-Regular'", "monospace"],
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, rgba(255,51,0,0.03), transparent 80%), radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,51,0,0.1), transparent)",
        "tech-grid":
          "linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)",
      },
      backgroundSize: {
        "grid-size": "40px 40px",
      },
      animation: {
        "flicker-in": "flicker-in 0.6s ease-out forwards",
        "pulse-slow": "pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scanline": "scanline 8s linear infinite",
      },
      keyframes: {
        "flicker-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "scanline": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

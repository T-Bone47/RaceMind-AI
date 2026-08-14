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
        carbon: "#0A0B0D",
        graphite: {
          DEFAULT: "#17191D",
          light: "#212429",
        },
        border: "#2A2D33",
        electric: {
          DEFAULT: "#2F7FFF",
          dim: "#1B4FB0",
        },
        signal: {
          green: "#22D67A",
          amber: "#FFB020",
          red: "#FF4D4D",
        },
        ink: {
          primary: "#F5F6F7",
          secondary: "#9CA3AF",
          muted: "#6B7280",
        },
      },
      fontFamily: {
        sans: ["'Fira Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'Fira Code'", "ui-monospace", "'SFMono-Regular'", "monospace"],
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, rgba(47,127,255,0.08), transparent 60%), radial-gradient(ellipse 80% 50% at 50% -10%, rgba(47,127,255,0.15), transparent)",
      },
      animation: {
        "flicker-in": "flicker-in 0.6s ease-out",
      },
      keyframes: {
        "flicker-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

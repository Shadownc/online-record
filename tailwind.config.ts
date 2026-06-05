import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "#030304",
        surface: "#0F1115",
        foreground: "#FFFFFF",
        stardust: "#94A3B8",
        boundary: "#1E293B",
        bitcoin: "#F7931A",
        burnt: "#EA580C",
        gold: "#FFD600",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        orange: "0 0 30px -5px rgba(247,147,26,0.6)",
        gold: "0 0 20px rgba(255,214,0,0.3)",
        card: "0 0 50px -10px rgba(247,147,26,0.1)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        orbitReverse: {
          to: { transform: "rotate(-360deg)" },
        },
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "spin-reverse": "orbitReverse 15s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;

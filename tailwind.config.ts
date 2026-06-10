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
        void: "#02040A",
        surface: "#07111F",
        foreground: "#F8FBFF",
        stardust: "#94A3B8",
        boundary: "#1E3A5F",
        bitcoin: "#38BDF8",
        burnt: "#8B5CF6",
        gold: "#FBBF24",
        signal: "#22D3EE",
        nebula: "#312E81",
        plasma: "#A78BFA",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        orange: "0 0 30px -8px rgba(34,211,238,0.55)",
        gold: "0 0 22px rgba(167,139,250,0.26)",
        card: "0 0 54px -18px rgba(56,189,248,0.18)",
        signal: "0 0 34px -10px rgba(34,211,238,0.5)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        orbitReverse: {
          to: { transform: "rotate(-360deg)" },
        },
        starDrift: {
          "0%": { transform: "translate3d(0, 0, 0)", backgroundPosition: "0 0, 38px 64px, 120px 40px, 84px 130px" },
          "100%": { transform: "translate3d(-18px, 12px, 0)", backgroundPosition: "42px 26px, 82px 96px, 164px 74px, 126px 158px" },
        },
        particleFloat: {
          "0%, 100%": { transform: "translate3d(0, 0, 0)" },
          "50%": { transform: "translate3d(10px, -14px, 0)" },
        },
        networkPulse: {
          "0%, 100%": { opacity: "0.14" },
          "50%": { opacity: "0.28" },
        },
        glowBreathe: {
          "0%, 100%": { opacity: "0.45", transform: "scale(1)" },
          "50%": { opacity: "0.78", transform: "scale(1.08)" },
        },
        nodePingSlow: {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.35)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        toastIn: {
          "0%": { opacity: "0", transform: "translateY(-12px) scale(0.97)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        "spin-reverse": "orbitReverse 15s linear infinite",
        "star-drift": "starDrift 15s ease-in-out infinite alternate",
        "particle-float": "particleFloat 11s ease-in-out infinite",
        "network-pulse": "networkPulse 13s ease-in-out infinite",
        "glow-breathe": "glowBreathe 12s ease-in-out infinite",
        "node-ping-slow": "nodePingSlow 10s ease-in-out infinite",
        marquee: "marquee 25s linear infinite",
        "toast-in": "toastIn 0.3s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;

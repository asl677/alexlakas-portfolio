import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inconsolata: ["var(--font-inconsolata)", "monospace"],
        inter: ["var(--font-inter)", "sans-serif"],
        "space-grotesk": ["var(--font-space-grotesk)", "sans-serif"],
        "space-mono": ["var(--font-space-mono)", "monospace"],
        wagon: ["var(--font-wagon)", "serif"],
      },
      colors: {
        red: {
          accent: "#ff1111",
        },
        grey: {
          100: "#f5f5f5",
          200: "#e5e5e5",
          800: "#1a1a1a",
          900: "#0d0d0d",
        },
      },
      animation: {
        "spin-cube": "spinCube 8s linear infinite",
      },
      keyframes: {
        spinCube: {
          "0%": { transform: "rotateX(0deg) rotateY(0deg)" },
          "100%": { transform: "rotateX(360deg) rotateY(360deg)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;

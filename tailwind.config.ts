import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "gh-dark": "#0d1117",
        "gh-darker": "#010409",
        "gh-border": "#30363d",
        "gh-text": "#e6edf3",
        "gh-text-secondary": "#7d8590",
        "gh-success": "#238636",
        "gh-danger": "#da3633",
        "gh-warning": "#d29922",
        "gh-info": "#58a6ff",
        "gh-accent": "#1f6feb",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        slideIn: {
          "0%": { transform: "translateX(-10px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

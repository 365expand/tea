import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f4f8f2",
          100: "#e5efdf",
          200: "#ccdfc2",
          300: "#a7c79a",
          400: "#7daa6c",
          500: "#5c8e4b",
          600: "#467139",
          700: "#385a2f",
          800: "#2f4929",
          900: "#283d24",
          950: "#12200f"
        },
        ink: {
          50: "#f7f7f6",
          100: "#eeeeec",
          200: "#d9d9d4",
          300: "#b8b8b0",
          400: "#919187",
          500: "#74746b",
          600: "#5d5d55",
          700: "#4c4c46",
          800: "#41413c",
          900: "#393935",
          950: "#1d1d1b"
        }
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono'", "var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"]
      }
    }
  },
  plugins: []
};

export default config;

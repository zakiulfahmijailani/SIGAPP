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
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      colors: {
        navy: {
          DEFAULT: "#0D2137",
          light: "#132D47",
        },
        teal: {
          DEFAULT: "#00B4B4",
          muted: "#009E9E",
        },
        surface: "#F4F6F9",
        card: "#FFFFFF",
      },
    },
  },
  plugins: [],
};
export default config;

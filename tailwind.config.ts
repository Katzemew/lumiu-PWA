import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lumiu-whiteboard.tsx",
  ],
  theme: {
    extend: {
      colors: {
        lumiu: {
          bg: "#D6D1FA",
          surface: "#F4F0FF",
          button: "#A388F6",
          purple: "#6E2CF3",
          text: "#4A3F8D",
          border: "#D8CEFF",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;

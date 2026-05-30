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
        playfair: ["Playfair Display", "serif"],
        sans: ["DM Sans", "sans-serif"],
      },
      colors: {
        rose: {
          DEFAULT: "#E8756A",
          light: "#F5A99E",
          pale: "#FDF0EE",
        },
        sage: {
          DEFAULT: "#7BAF8E",
          light: "#B4D4BE",
          pale: "#EEF6F1",
        },
        cream: "#FBF7F2",
        "warm-white": "#FFFCF8",
        "text-dark": "#2C2018",
        "text-mid": "#6B5044",
        "text-light": "#A8917F",
        gold: {
          DEFAULT: "#C8A96E",
          light: "#EDD99A",
        },
        error: "#D64545",
      },
    },
  },
  plugins: [],
};
export default config;

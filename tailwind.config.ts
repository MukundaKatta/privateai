import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: { extend: { colors: { brand: { 400: "#f472b6", 500: "#ec4899", 600: "#db2777", 700: "#be185d" } } } },
  plugins: [],
};
export default config;

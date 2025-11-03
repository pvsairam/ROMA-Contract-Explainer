import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "ui-sans-serif", "system-ui"] },
      colors: {
        canvas: "#F7F9FC",
        mist: "#EEF2F7",
        ink: "#0F172A",
        soft: {
          blue: "#9EC5FF",
          lavender: "#C6B8FF",
          mint: "#BFF0DA",
          gray: "#D9DFE7"
        }
      },
      boxShadow: {
        glass: "0 8px 30px rgba(31, 38, 135, 0.15)"
      }
    }
  },
  plugins: []
};
export default config;

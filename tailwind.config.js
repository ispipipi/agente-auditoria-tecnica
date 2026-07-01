/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#0e1726",
        },
        ink: "#183044",
        cloud: "#eef4f8",
        mist: "#f7fafc",
        aqua: "#8dd8e8",
        accent: "#0a6c8f",
        repair: "#0f8b4c",
        indemnify: "#c96a19",
        reject: "#c1422f",
        muted: "#6c8193",
      },
      boxShadow: {
        card: "0 22px 60px rgba(24, 48, 68, 0.12)",
        soft: "0 16px 36px rgba(24, 48, 68, 0.08)",
      },
      backgroundImage: {
        "hero-audit":
          "radial-gradient(circle at top left, rgba(19,114,142,0.18), transparent 28%), radial-gradient(circle at 82% 18%, rgba(141,216,232,0.24), transparent 22%), linear-gradient(180deg, rgba(255,255,255,0.92), rgba(240,246,249,0.98))",
      },
      fontFamily: {
        sans: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

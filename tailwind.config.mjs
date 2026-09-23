/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}", "./lib/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        flame: "#ff3b30",
        ember: "#ff6b35"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(255, 59, 48, 0.2)"
      }
    }
  },
  plugins: []
};

export default config;

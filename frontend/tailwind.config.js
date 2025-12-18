export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        rich: {
          gold: "#F59E0B",
          dark: "#0F172A",
          slate: "#1E293B",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "Avenir", "Helvetica", "Arial", "sans-serif"],
      },
      boxShadow: {
        brand: "0 10px 25px -5px rgba(245, 158, 11, 0.25), 0 8px 10px -6px rgba(245, 158, 11, 0.3)",
      },
      backgroundImage: {
        'radial-rich': "radial-gradient(1000px circle at 0% 0%, rgba(245,158,11,0.08) 0%, transparent 60%), radial-gradient(800px circle at 100% 0%, rgba(14,165,233,0.06) 0%, transparent 60%)",
      }
    },
  },
  plugins: [],
}

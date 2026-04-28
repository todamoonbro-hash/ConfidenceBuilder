const config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dce8ff",
          600: "#335dff",
          700: "#2a4be0"
        }
      }
    }
  },
  plugins: []
};

export default config;

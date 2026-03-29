/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#6C63FF",
        primaryMuted: "#EAE8FF",
        calm: "#4CAF50",
        mild: "#FFC107",
        moderate: "#FF9800",
        severe: "#F44336",
        surface: "#F8F7FC",
        bgMain: "#FFFFFF",
        textPrimary: "#1A1A2E",
        textSecondary: "#6B7280",
        friendAccent: "#FF8A65",
        counsellorAccent: "#42A5F5",
        psychiatristAccent: "#26A69A",
      },
    },
  },
  plugins: [],
};

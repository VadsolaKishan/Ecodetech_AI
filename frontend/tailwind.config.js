/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        industrial: {
          950: "#080C14",
          900: "#0B0F17",
          850: "#0F1626",
          800: "#131C2E",
          700: "#1E293B",
          600: "#334155",
          500: "#475569",
          400: "#94A3B8",
          300: "#CBD5E1",
          200: "#E2E8F0",
          100: "#F1F5F9",
          50: "#F8FAFC",
        },
        carbon: {
          green: "#10B981",
          emerald: "#059669",
          lime: "#84CC16",
          teal: "#14B8A6",
          amber: "#F59E0B",
          critical: "#EF4444",
          cyber: "#3B82F6",
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Menlo", "Courier New", "monospace"],
      },
      boxShadow: {
        "glow-green": "0 0 25px -5px rgba(16, 185, 129, 0.3)",
        "glow-critical": "0 0 25px -5px rgba(239, 68, 68, 0.3)",
        "glow-cyber": "0 0 25px -5px rgba(59, 130, 246, 0.3)",
        "card-dark": "0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
      }
    },
  },
  plugins: [],
}

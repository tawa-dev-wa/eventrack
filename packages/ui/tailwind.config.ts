import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../apps/web/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#16213E",
          secondary: "#2563EB",
          alert: "#F97316",
          success: "#22C55E",
          neutral: "#E2E8F0",
          background: "#F8FAFC",
          critical: "#EF4444",
        },
        sidebar: {
          DEFAULT: "#16213E",
          foreground: "#F8FAFC",
          muted: "#94A3B8",
          active: "#2563EB",
          border: "#1E3A5F",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
};

export default config;

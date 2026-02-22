import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./pages/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "var(--bg-base)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        "surface-hover": "var(--bg-hover)",
        "border-subtle": "var(--border-subtle)",
        "border-default": "var(--border-default)",
        "border-strong": "var(--border-strong)",
        "t-primary": "var(--text-primary)",
        "t-secondary": "var(--text-secondary)",
        "t-tertiary": "var(--text-tertiary)",
        accent: {
          DEFAULT: "var(--color-accent)",
          muted: "var(--accent-muted)"
        },
        risk: {
          low: "var(--risk-low)",
          "low-muted": "var(--risk-low-muted)",
          medium: "var(--risk-medium)",
          "medium-muted": "var(--risk-medium-muted)",
          high: "var(--risk-high)",
          "high-muted": "var(--risk-high-muted)"
        }
      },
      borderRadius: {
        card: "var(--radius)",
        inner: "var(--radius-inner)"
      },
      boxShadow: {
        card: "var(--shadow-card)",
        elevated: "var(--shadow-elevated)"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;

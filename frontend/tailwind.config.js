/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: "#050508",
          secondary: "#0a0a10",
        },
        surface: {
          glass: "rgba(255, 255, 255, 0.02)",
        },
        border: {
          default: "rgba(255, 255, 255, 0.06)",
          hover: "rgba(255, 255, 255, 0.12)",
        },
        text: {
          primary: "#ffffff",
          secondary: "rgba(255, 255, 255, 0.55)",
          muted: "rgba(255, 255, 255, 0.30)",
        },
        accent: {
          indigo: "#6366f1",
          purple: "#a855f7",
          pink: "#ec4899",
          emerald: "#00ff88",
          cyan: "#00f0ff",
        },
        risk: {
          CRITICAL_SHOR: "#ff0040",
          HIGH_SHOR: "#ff3366",
          MEDIUM_GROVER: "#ffaa00",
          LOW_CLASSICAL: "#fbbf24",
          DEPRECATED_CLASSICAL: "#71717a",
          QUANTUM_SAFE: "#00ff88",
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.16, 1, 0.3, 1) infinite',
        'border-draw': 'borderDraw 4s linear infinite',
        'grid-drift': 'gridDrift 60s linear infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.96)' },
        },
        gridDrift: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(40px)' },
        }
      }
    },
  },
  plugins: [],
}

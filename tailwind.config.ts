import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
                heading: ['var(--font-outfit)', 'sans-serif'],
            },
            colors: {
                border: "rgb(var(--border) / <alpha-value>)",
                input: "rgb(var(--input) / <alpha-value>)",
                ring: "rgb(var(--ring) / <alpha-value>)",
                background: "rgb(var(--background) / <alpha-value>)",
                foreground: "rgb(var(--foreground) / <alpha-value>)",
                primary: {
                    DEFAULT: "rgb(var(--primary) / <alpha-value>)",
                    foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
                },
                secondary: {
                    DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
                    foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
                },
                muted: {
                    DEFAULT: "rgb(var(--muted) / <alpha-value>)",
                    foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
                },
                accent: {
                    DEFAULT: "rgb(var(--accent) / <alpha-value>)",
                    foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
                },
                surface: {
                    card: "rgb(var(--surface-card) / <alpha-value>)",
                    hover: "rgb(var(--surface-hover) / <alpha-value>)",
                    glass: "rgb(var(--surface-glass) / <alpha-value>)",
                    // Legacy maps
                    page: "rgb(var(--background) / <alpha-value>)",
                    interactive: "rgb(var(--surface-hover) / <alpha-value>)",
                },
                status: {
                    success: "rgb(var(--status-success) / <alpha-value>)",
                    warning: "rgb(var(--status-warning) / <alpha-value>)",
                    error: "rgb(var(--status-error) / <alpha-value>)",
                },
                text: {
                    primary: "rgb(var(--foreground) / <alpha-value>)",
                    secondary: "rgb(var(--muted-foreground) / <alpha-value>)",
                    muted: "rgb(var(--muted-foreground) / <alpha-value>)",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            animation: {
                "float": "float 8s ease-in-out infinite",
                "aurora": "aurora-premium 20s ease infinite",
                "shimmer": "shimmery 3s infinite linear",
                "fade-in-up": "fade-in-up 0.8s ease-out forwards",
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "premium-glass": "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0))",
                "premium-glass-hover": "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
};
export default config;

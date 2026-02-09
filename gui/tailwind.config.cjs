/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./screens/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#1ce36c',
                'background-dark': '#112117',
                'surface-dark': '#182b20',
                'border-dark': '#2a4234',
                'text-secondary': '#94c7a8',
            },
            fontFamily: {
                display: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
                grotesk: ['Space Grotesk', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'scan': 'scan 3s ease-in-out infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                scan: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(500px)' },
                }
            }
        },
    },
    plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#FFAD00',
                secondary: '#750D10',
                'dark-bg': '#130707',
                'dark-card': '#1C0D0D',
                'dark-border': '#3D1416',
                'dark-text-primary': '#FFFFFF',
                'dark-text-secondary': '#B0A0A0',
            },
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'sans-serif'],
            },
        },
    },
    plugins: [],
}

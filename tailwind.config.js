/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'ipad': '768px',
        'ipad-landscape': '1024px',
      },
      aspectRatio: {
        'ipad-landscape': '4/3',
      },
    },
  },
  plugins: [],
}
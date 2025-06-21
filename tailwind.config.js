/** @type {import('tailwindcss').Config} */
export default {
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
}
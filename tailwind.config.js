/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Sketch-style utilities
      borderRadius: {
        'sketch': '30% 70% 70% 30% / 30% 30% 70% 70%',
        'sketch-sm': '20% 80% 80% 20% / 20% 20% 80% 80%',
      },
      boxShadow: {
        'sketch': '4px 4px 0px 0px rgba(0,0,0,0.1), 2px 2px 0px 0px rgba(0,0,0,0.1)',
      }
    },
  },
  plugins: [],
}


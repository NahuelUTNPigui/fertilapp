/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],
  darkMode: 'class',
  //darkMode: ['selector','[data-theme="dark"]'],
  theme: {
    extend: {}
  },
  daisyui: {
    themes: ["light", "dark", "forest"]

  },
  plugins: [require('daisyui'),require("@tailwindcss/typography")]
};

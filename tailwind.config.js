const colors = require("tailwindcss/colors");

module.exports = {
  purge: ['./pages/**/*.tsx', './components/**/*.tsx'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        gray: colors.trueGray,
        coolGray: colors.coolGray
      },

      screens: {
        "hover-none": {"raw": "(hover: none)" }
      }
    },
  },
  variants: {
    extend: {
      borderRadius: ["group-hover"],
      display: ["group-hover"],
      animation: ["hover"],
      visibility: ["hover", "group-hover", "focus"],
      backgroundColor: ["group-focus"],
      borderColor: ["group-focus"]
    },
  },
  plugins: [],
}

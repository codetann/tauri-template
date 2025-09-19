// tailwind-plugins.js
import plugin from "tailwindcss/plugin";
import colors from "../variables/colors";

const customPlugin = plugin(({ addBase }) => {
  addBase({
    ":root": {
      "--color-white-alpha-50": colors.whiteAlpha[50],
      "--color-white-alpha-100": colors.whiteAlpha[100],
      "--color-white-alpha-200": colors.whiteAlpha[200],
      "--color-white-alpha-300": colors.whiteAlpha[300],
      "--color-white-alpha-400": colors.whiteAlpha[400],
      "--color-white-alpha-500": colors.whiteAlpha[500],
      "--color-white-alpha-600": colors.whiteAlpha[600],
      "--color-white-alpha-700": colors.whiteAlpha[700],
      "--color-white-alpha-800": colors.whiteAlpha[800],
      "--color-white-alpha-900": colors.whiteAlpha[900],
      "--primary-color": colors.primary.color,
      "--primary-color-light": colors.primary.color,
      "--primary-color-dark": colors.primary.color,
      // HeroUI CSS variables
      "--heroui-primary": "247 111 83", // Default orange in HSL format
      "--heroui-primary-foreground": "255 255 255",
    },
  });
});

export default customPlugin;

// hero.ts
import { heroui } from "@heroui/react";
import { colors } from "../variables";

export default heroui({
  themes: {
    light: {
      colors: {
        foreground: colors.primary.bgDark,
        primary: {
          DEFAULT: "hsl(var(--heroui-primary))",
          foreground: "hsl(var(--heroui-primary-foreground))",
        },
      },
    },
    dark: {
      colors: {
        foreground: colors.primary.bgLight,
        primary: {
          DEFAULT: "hsl(var(--heroui-primary))",
          foreground: "hsl(var(--heroui-primary-foreground))",
        },
      },
    },
  },
});

// MyButton.tsx
import { extendVariants, Button as HeroButton } from "@heroui/react";

export const Button = extendVariants(HeroButton, {
  variants: {
    radius: {
      md: "rounded-md",
      lg: "rounded-lg",
      sm: "rounded-sm",
    },
    size: {},
  },
  defaultVariants: {
    radius: "md",
  },
  compoundVariants: [
    // <- modify/add compound variants
  ],
});

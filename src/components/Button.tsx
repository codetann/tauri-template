// MyButton.tsx
import { extendVariants, Button as HeroButton } from "@heroui/react";

export const Button = extendVariants(HeroButton, {
  variants: {
    size: {},
  },
  defaultVariants: {
    // radius: "xl",
  },
  compoundVariants: [
    // <- modify/add compound variants
  ],
});

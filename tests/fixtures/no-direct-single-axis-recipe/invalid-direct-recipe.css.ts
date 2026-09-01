import { recipe } from "@vanilla-extract/recipes";

export const metric = recipe({
  base: { margin: 0 },
  variants: {
    size: {
      small: { fontSize: 14 },
      large: { fontSize: 20 },
    },
  },
});

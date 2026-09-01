import { recipe } from "@vanilla-extract/recipes";

export const button = recipe({
  variants: {
    size: { small: { padding: 4 }, large: { padding: 8 } },
    tone: { neutral: { color: "black" }, danger: { color: "red" } },
  },
});

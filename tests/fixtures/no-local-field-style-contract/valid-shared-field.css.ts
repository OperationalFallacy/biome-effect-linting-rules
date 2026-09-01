import { style } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

export const fieldRoot = style({ display: "flex" });
export const fieldMessage = recipe({
  variants: {
    tone: {
      description: { color: "gray" },
      error: { color: "red" },
    },
  },
});

import { createVar } from "@vanilla-extract/css";
import { recipe } from "@vanilla-extract/recipes";

const childGap = createVar();

export const tabs = recipe({
  base: { vars: { [childGap]: "4px" } },
  variants: {
    orientation: {
      horizontal: { vars: { [childGap]: "8px" } },
      vertical: { vars: { [childGap]: "12px" } },
    },
  },
});

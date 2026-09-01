import { style, styleVariants } from "@vanilla-extract/css";

export const field = style({ display: "flex" });
export const appearance = styleVariants({
  default: { color: "black" },
  danger: { color: "red" },
});

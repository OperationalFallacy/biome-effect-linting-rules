import { Effect } from "effect";

declare const _unused: Effect.Effect<number>;

export const describe = (kind: "a" | "b" | "c"): string => {
  switch (kind) {
    case "a":
      return "Alpha";
    case "b":
      return "Beta";
    default:
      return "Gamma";
  }
};

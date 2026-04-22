// No Effect or @effect-atom/atom-react import — the rule must not apply to
// plain TypeScript files that do not opt into the Effect ecosystem.

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

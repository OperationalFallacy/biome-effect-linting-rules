// The upstream file guard recognises bare side-effect imports of the form
// `import "effect/<module>"`; this fixture exercises that branch.
import "effect/Option";

export const render = (value: "loading" | "ready" | "error"): string => {
  switch (value) {
    case "loading":
      return "...";
    case "ready":
      return "done";
    default:
      return "failed";
  }
};

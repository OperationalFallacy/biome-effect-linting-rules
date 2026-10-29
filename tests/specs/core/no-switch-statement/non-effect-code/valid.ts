const describe = (kind: "a" | "b" | "c"): string => {
  switch (kind) {
    case "a":
      return "Alpha";
    case "b":
      return "Beta";
    default:
      return "Gamma";
  }
};

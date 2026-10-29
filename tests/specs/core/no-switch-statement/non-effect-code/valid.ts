/**
 * Correctly uses ordinary branching in a module outside Effect composition.
 * The function has no effectful operation or service dependencies.
 */
export const describePhase = (phase: "ready" | "loading" | "failed") => {
  switch (phase) {
    case "ready":
      return "Ready";
    case "loading":
      return "Loading";
    default:
      return "Failed";
  }
};

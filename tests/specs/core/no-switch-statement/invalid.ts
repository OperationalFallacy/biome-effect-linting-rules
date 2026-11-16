/**
 * The pure description incorrectly spreads its label selection across switch
 * cases and function returns. The decision concerns one value, even without
 * an Effect operation around it.
 */
export const describePhase = (phase: "ready" | "loading" | "failed") => {
  // Case returns incorrectly split describePhase's single label decision.
  switch (phase) {
    case "ready":
      return "Ready";
    case "loading":
      return "Loading";
    default:
      return "Failed";
  }
};

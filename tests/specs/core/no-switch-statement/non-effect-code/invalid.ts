/**
 * Match.value accepts plain domain values and needs no Effect runtime. A phase
 * description can stay pure until an Effect operation needs to use its result.
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

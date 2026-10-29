import { Effect, Match } from "effect";

type Phase = "ready" | "loading" | "failed";

/**
 * Questionably splits pure value selection across switch return paths.
 * Match can express the complete selection as one value.
 */
export const describePhase = (phase: Phase) => {
  switch (phase) {
    case "ready":
      return "Ready";
    case "loading":
      return "Loading";
    default:
      return "Failed";
  }
};

export function isReady(phase: Phase) {
  switch (phase) {
    case "ready":
      return true;
    default:
      return false;
  }
}

/**
 * Correctly uses Match for pure value selection.
 */
export const describeMatched = (phase: Phase) =>
  Match.value(phase).pipe(
    Match.when("ready", () => "Ready"),
    Match.when("loading", () => "Loading"),
    Match.orElse(() => "Failed"),
  );

/**
 * Correctly keeps branching inside a named Effect operation.
 * The branch executes when the operation runs.
 */
export const describeOperation = Effect.fn("describeOperation")(function* (
  phase: Phase,
) {
  switch (phase) {
    case "ready":
      return "Ready";
    case "loading":
      return "Loading";
    default:
      return "Failed";
  }
});

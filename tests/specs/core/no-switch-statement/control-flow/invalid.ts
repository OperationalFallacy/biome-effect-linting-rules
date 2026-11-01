import { Effect, Match } from "effect";

type Phase = "ready" | "loading" | "failed";

/**
 * Match.when narrows the phase within its callback. Match.orElse receives the
 * phases that earlier branches did not handle, so the fallback participates in
 * the same typed decision.
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
 * A phase description can remain a pure function. Effect.sync can defer that
 * function when an operation needs to compute the description during execution.
 */
export const describeMatched = (phase: Phase) =>
  Match.value(phase).pipe(
    Match.when("ready", () => "Ready"),
    Match.when("loading", () => "Loading"),
    Match.orElse(() => "Failed"),
  );

/**
 * Keep the phase selection pure and reuse it from Effect.sync. Effect.fn can
 * then supply tracing for the complete operation.
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

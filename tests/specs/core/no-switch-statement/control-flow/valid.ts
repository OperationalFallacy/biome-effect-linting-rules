import { Effect, Match } from "effect";

type Phase = "ready" | "loading" | "failed";

/**
 * Correctly expresses a pure selection with Match. The result can continue
 * into later transformations as a value.
 */
export const describePhase = (phase: Phase) =>
  Match.value(phase).pipe(
    Match.when("ready", () => "Ready"),
    Match.when("loading", () => "Loading"),
    Match.orElse(() => "Failed"),
  );

export const isReady = (phase: Phase) =>
  Match.value(phase).pipe(
    Match.when("ready", () => true),
    Match.orElse(() => false),
  );

export const describeMatched = describePhase;

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

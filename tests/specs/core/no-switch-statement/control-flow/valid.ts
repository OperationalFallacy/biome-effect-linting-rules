import { Effect, Match } from "effect";

type Phase = "ready" | "loading" | "failed";

/**
 * Match.when narrows the input for its branch. Match.orElse supplies the
 * fallback for the remaining phases, and the whole decision returns one value.
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
 * Effect.sync invokes the pure phase description each time the operation runs.
 * Effect.fn records the operation name for tracing.
 */
export const describeOperation = Effect.fn("describeOperation")((phase: Phase) =>
  Effect.sync(() => describePhase(phase)),
);

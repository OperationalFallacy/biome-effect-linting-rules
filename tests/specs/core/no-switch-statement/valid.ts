import { Match } from "effect";

/**
 * describePhase correctly selects its label in one Match expression. Its pure
 * decision returns one value without separate switch exits.
 */
export const describePhase = (phase: "ready" | "loading" | "failed") =>
  // Match correctly keeps the ready, loading, and fallback labels together.
  Match.value(phase).pipe(
    Match.when("ready", () => "Ready"),
    Match.when("loading", () => "Loading"),
    Match.orElse(() => "Failed"),
  );

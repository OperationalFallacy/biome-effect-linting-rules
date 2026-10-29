import { Effect, Match } from "effect";

/**
 * Questionably reports domain outcomes through string tokens. Callers must
 * interpret text before they can decide how to handle the result.
 */
export const summarize = Effect.fn("summarize")(
  (rows: ReadonlyArray<unknown>) =>
    Match.value(rows.length).pipe(
      Match.when(0, () => Effect.succeed("empty")),
      Match.orElse(() => Effect.succeed("ready")),
    ),
);

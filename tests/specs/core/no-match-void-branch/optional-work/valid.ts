import { Effect } from "effect";

/**
 * Correctly uses Effect.when for optional work. Effect.asVoid discards the
 * conditional result because this operation only reports completion.
 */
export const saveWhenEnabled = Effect.fn("saveWhenEnabled")(
  (enabled: boolean) =>
    Effect.logInfo("Saved settings").pipe(
      Effect.when(Effect.succeed(enabled)),
      Effect.asVoid,
    ),
);

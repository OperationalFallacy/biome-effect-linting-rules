import { Clock, Effect } from "effect";

/**
 * makeTimeOperations incorrectly separates clock reads and Date construction
 * from ISO formatting in local Effects. The reader must follow staged into
 * load and read into formatted to reconstruct the complete time queries.
 */
export const makeTimeOperations = () =>
  Effect.gen(function* () {
    const clock = yield* Clock.Clock;

    // staged incorrectly separates load's clock read and Date from ISO formatting.
    const staged = clock.currentTimeMillis.pipe(
      Effect.map((time) => new Date(time)),
    );

    const run = Effect.gen(function* () {
      // read incorrectly separates run's clock read and Date from ISO formatting.
      const read = clock.currentTimeMillis.pipe(
        Effect.map((time) => new Date(time)),
      );

      // formatted incorrectly adds another Effect binding used only by the next yield.
      const formatted = read.pipe(Effect.map((time) => time.toISOString()));

      return yield* formatted;
    });

    const load = staged.pipe(Effect.map((time) => time.toISOString()));

    return { run, load };
  });

import { Clock, Effect } from "effect";

/**
 * makeTimeOperations correctly keeps each clock read, Date construction,
 * and ISO formatting in one pipeline. The run and load declarations define complete time
 * queries, so the reader can follow each without intermediate Effect lookups.
 */
export const makeTimeOperations = () =>
  Effect.gen(function* () {
    const clock = yield* Clock.Clock;

    const run = Effect.gen(function* () {
      // The direct yield correctly keeps run's clock read and ISO formatting together.
      return yield* clock.currentTimeMillis.pipe(
        Effect.map((time) => new Date(time)),
        Effect.map((time) => time.toISOString()),
      );
    });

    // load correctly names the complete clock read and ISO formatting pipeline.
    const load = clock.currentTimeMillis.pipe(
      Effect.map((time) => new Date(time)),
      Effect.map((time) => time.toISOString()),
    );

    return { run, load };
  });

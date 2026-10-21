import { Effect } from "effect";

export const makeOperations = () =>
  Effect.gen(function* () {
    const staged = Effect.succeed(1);
    const run = Effect.gen(function* () {
      const parsed = Effect.succeed(2);
      const evaluated = parsed.pipe(Effect.map((value) => value + 1));
      return yield* evaluated;
    });
    const load = staged.pipe(Effect.map((value) => value + 1));

    return { run, load };
  });

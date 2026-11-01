import { Context, Effect, Layer, Ref } from "effect";

interface CounterApi {
  readonly read: Effect.Effect<number>;
}

export class Counter extends Context.Service<Counter, CounterApi>()(
  "example/Counter",
) {}

/**
 * Correctly composes dependent initialization inside the service constructor.
 * The layer receives the completed construction effect.
 */
const makeCounter = Effect.gen(function* () {
  const count = yield* Ref.make(0);
  const initial = yield* Ref.get(count).pipe(
    Effect.map((value) => ({ value })),
  );
  return { read: Effect.succeed(initial.value) };
});

export const counterLayer = Layer.effect(Counter, makeCounter);

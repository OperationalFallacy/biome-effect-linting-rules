import { Context, Effect, Layer, Ref } from "effect";

export class Seed extends Context.Service<Seed, { readonly initial: number }>()(
  "example/Seed",
) {
  static readonly layer = Layer.succeed(Seed, { initial: 0 });
}
interface CounterApi {
  readonly increment: Effect.Effect<number>;
}
export class Counter extends Context.Service<Counter, CounterApi>()(
  "example/Counter",
  {
    make: Effect.gen(function* () {
      const seed = yield* Seed;
      const count = yield* Ref.make(seed.initial);
      return { increment: Ref.updateAndGet(count, (value) => value + 1) };
    }),
  },
) {
  static readonly layer = Layer.effect(Counter, Counter.make).pipe(
    Layer.provide(Seed.layer),
  );
}
export const incrementCounter = Effect.gen(function* () {
  const counter = yield* Counter;
  return yield* counter.increment;
});

/**
 * incrementNamed adds 1 to Counter and returns its new count. incrementTwice
 * must return 1 and then 2 from the same counter. Effect.provide inside
 * incrementNamed creates a fresh Counter on each call, so both results are 1.
 * Provide the layer once around the complete sequence.
 */
export const incrementNamed = Effect.fn("increment")(() =>
  // It incorrectly provides Counter inside each increment call.
  incrementCounter.pipe(Effect.provide(Counter.layer)),
);

export const makeApi = Effect.sync(() => ({ increment: incrementNamed }));

export const incrementTwice = Effect.gen(function* () {
  const api = yield* makeApi;

  const first = yield* api.increment();
  const second = yield* api.increment();
  return { first, second };
});

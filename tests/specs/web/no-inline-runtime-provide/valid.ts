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
 * returns 1 and then 2 because its layer supplies one Counter for both calls.
 * incrementNamed requires that existing Counter, so each call updates the
 * same Ref.
 */
export const incrementNamed = Effect.fn("increment")(
  // It correctly requires the caller's Counter.
  () => incrementCounter,
);

export const makeApi = Effect.sync(() => ({ increment: incrementNamed }));

export const incrementTwice = Effect.gen(function* () {
  const api = yield* makeApi;

  const first = yield* api.increment();
  const second = yield* api.increment();
  return { first, second };
}).pipe(
  // It correctly provides one Counter for both increments.
  Effect.provide(Counter.layer),
);

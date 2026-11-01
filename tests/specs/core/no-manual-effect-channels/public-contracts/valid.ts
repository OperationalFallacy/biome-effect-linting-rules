import { Context, Effect, Layer, Ref } from "effect";

/**
 * Correctly declares Effect channels in a service contract. Layer construction
 * checks the inferred implementation against that contract.
 */
export class Counter extends Context.Service<
  Counter,
  {
    readonly read: Effect.Effect<number>;
    readonly increment: Effect.Effect<number>;
  }
>()("example/Counter") {
  static readonly layer = Layer.effect(
    Counter,
    Effect.gen(function* () {
      const count = yield* Ref.make(0);
      const read = Ref.get(count);
      const increment = Ref.updateAndGet(count, (value) => value + 1);

      return { read, increment };
    }),
  );
}

export const incrementTwice = Effect.fn("incrementTwice")(function* () {
  const counter = yield* Counter;
  yield* counter.increment;
  return yield* counter.increment;
});

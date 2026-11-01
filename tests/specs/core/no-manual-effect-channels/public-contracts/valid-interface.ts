import { Effect, Ref } from "effect";

/**
 * Correctly declares Effect channels in a public interface. The factory uses
 * satisfies to check the implementation without replacing its inferred type.
 */
export interface CounterApi {
  readonly read: Effect.Effect<number>;
  readonly increment: Effect.Effect<number>;
}

export const makeCounter = Effect.fn("makeCounter")(function* () {
  const count = yield* Ref.make(0);
  const read = Ref.get(count);
  const increment = Ref.updateAndGet(count, (value) => value + 1);

  return { read, increment } satisfies CounterApi;
});

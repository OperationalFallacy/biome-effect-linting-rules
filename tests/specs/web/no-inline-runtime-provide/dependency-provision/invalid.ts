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
 * Incorrectly rebuilds the service layer inside an API operation. Each call
 * starts a new Ref-backed counter, so repeated calls return one again.
 */
export const makeApi = Effect.gen(function* () {
  const increment = Effect.fn("increment")(function* () {
    return yield* incrementCounter.pipe(Effect.provide(Counter.layer));
  });
  return { increment };
});

/**
 * Incorrectly provides dependencies inside reusable generator operations.
 * Each wrapper replaces the caller's counter with a freshly constructed one.
 */
export const providedGenerator = Effect.gen(function* () {
  return yield* incrementCounter.pipe(Effect.provide(Counter.layer));
});
export const incrementNamed = Effect.fn("increment")(function* () {
  return yield* incrementCounter.pipe(Effect.provide(Counter.layer));
});
export const incrementFunction = Effect.fn(function* () {
  return yield* incrementCounter.pipe(Effect.provide(Counter.layer));
});
export const incrementUntraced = Effect.fnUntraced(function* () {
  return yield* incrementCounter.pipe(Effect.provide(Counter.layer));
});
export const incrementEager = Effect.fnUntracedEager(function* () {
  return yield* incrementCounter.pipe(Effect.provide(Counter.layer));
});

/**
 * Incorrectly rebuilds dependencies through data-first provision inside the
 * same reusable operation forms. The counter still resets on each call.
 */
export const dataFirstGenerator = Effect.gen(function* () {
  return yield* Effect.provide(incrementCounter, Counter.layer);
});
export const dataFirstNamed = Effect.fn("increment")(function* () {
  return yield* Effect.provide(incrementCounter, Counter.layer);
});
export const dataFirstFunction = Effect.fn(function* () {
  return yield* Effect.provide(incrementCounter, Counter.layer);
});
export const dataFirstUntraced = Effect.fnUntraced(function* () {
  return yield* Effect.provide(incrementCounter, Counter.layer);
});
export const dataFirstEager = Effect.fnUntracedEager(function* () {
  return yield* Effect.provide(incrementCounter, Counter.layer);
});

/**
 * Correctly provides dependencies around the complete application program.
 * Both increments share the same constructed counter during this execution.
 */
export const startup = Effect.gen(function* () {
  const first = yield* incrementCounter;
  const second = yield* incrementCounter;
  return { first, second };
}).pipe(Effect.provide(Counter.layer));
export const runStartup = () => Effect.runPromise(startup);
export const forkStartup = () =>
  Effect.runFork(Effect.provide(incrementCounter, Counter.layer));

export const Request = Context.Service<{ readonly requestId: string }>(
  "example/Request",
);

/**
 * Correctly provides dynamic request data without reconstructing a service layer.
 */
export const readRequest = Effect.fn("readRequest")((requestId: string) =>
  Effect.gen(function* () {
    const request = yield* Request;
    return request.requestId;
  }).pipe(Effect.provideService(Request, { requestId })),
);

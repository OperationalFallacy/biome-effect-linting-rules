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

/**
 * Correctly yields the caller's service from a reusable operation. Its inferred
 * context requirement keeps dependency ownership visible to application assembly.
 */
export const incrementCounter = Effect.gen(function* () {
  const counter = yield* Counter;
  return yield* counter.increment;
});
export const incrementNamed = Effect.fn("increment")(() => incrementCounter);
export const incrementFunction = incrementNamed;
export const incrementUntraced = incrementNamed;
export const incrementEager = incrementNamed;
export const providedGenerator = incrementCounter;
export const dataFirstGenerator = incrementCounter;
export const dataFirstNamed = incrementNamed;
export const dataFirstFunction = incrementNamed;
export const dataFirstUntraced = incrementNamed;
export const dataFirstEager = incrementNamed;

/**
 * Correctly exposes the complete operation without hiding a new layer inside it.
 */
export const makeApi = Effect.gen(function* () {
  return { increment: incrementNamed };
});

/**
 * Correctly provides dependencies around the complete application program.
 * Repeated increments now advance the shared counter from one to two.
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
 * Correctly supplies dynamic request data through provideService.
 */
export const readRequest = Effect.fn("readRequest")((requestId: string) =>
  Effect.gen(function* () {
    const request = yield* Request;
    return request.requestId;
  }).pipe(Effect.provideService(Request, { requestId })),
);

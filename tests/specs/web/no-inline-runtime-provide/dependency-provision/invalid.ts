import { Effect, pipe, Layer } from "effect";

{
  const makeCounter = Effect.gen(function* () {
    const read = Effect.fn("read")(function* () {
      return yield* task.pipe(Effect.provide(live));
    });
    return { read };
  });
}

{
  const providedGenerator = Effect.gen(function* () {
    return yield* task.pipe(Effect.provide(layer));
  });
}

{
  const providedNamedFunction = Effect.fn("load")(function* () {
    return yield* task.pipe(Effect.provide(layer));
  });
}

{
  const providedFunction = Effect.fn(function* () {
    return yield* task.pipe(Effect.provide(layer));
  });
}

{
  const providedUntracedFunction = Effect.fnUntraced(function* () {
    return yield* task.pipe(Effect.provide(layer));
  });
}

{
  const providedEagerFunction = Effect.fnUntracedEager(function* () {
    return yield* task.pipe(Effect.provide(layer));
  });
}

{
  const dataFirstGenerator = Effect.gen(function* () {
    return yield* Effect.provide(task, layer);
  });
}

{
  const dataFirstNamedFunction = Effect.fn("load")(function* () {
    return yield* Effect.provide(task, layer);
  });
}

{
  const dataFirstFunction = Effect.fn(function* () {
    return yield* Effect.provide(task, layer);
  });
}

{
  const dataFirstUntracedFunction = Effect.fnUntraced(function* () {
    return yield* Effect.provide(task, layer);
  });
}

{
  const dataFirstEagerFunction = Effect.fnUntracedEager(function* () {
    return yield* Effect.provide(task, layer);
  });
}

{
  const promiseMain = task.pipe(Effect.provide(layer));
  Effect.runPromise(promiseMain);
}

{
  const fiberMain = Effect.provide(task, layer);
  Effect.runFork(fiberMain);
}

{
  const live = Layer.effect(Service, make).pipe(Layer.provide(Dependencies));
}

{
  const requestContext = Effect.gen(function* () {
    return yield* task.pipe(Effect.provideService(Request, request));
  });
}

{
  const providedMain = Effect.gen(function* () {
    return 1;
  }).pipe(Effect.provide(layer));
}

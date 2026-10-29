import { Effect } from "effect";

{
  const nestedMap = Effect.map(Effect.succeed(1), (n) => n + 1);
}

{
  const nestedAcquisition = Effect.acquireUseRelease(Effect.succeed(1), use, release);
}

{
  const nestedContinuation = Effect.andThen(first, Effect.succeed(1));
}

{
  const pipeline = Effect.succeed(1).pipe(Effect.map((n) => n + 1));
}

{
  const namedCallback = Effect.flatMap(
    first,
    Effect.fn(function* (n) {
      return n + 1;
    }),
  );
}

{
  const untracedCallback = Effect.flatMap(
    first,
    Effect.fnUntraced(function* (n) {
      return n + 1;
    }),
  );
}

{
  const eagerCallback = Effect.flatMap(
    first,
    Effect.fnUntracedEager(function* (n) {
      return n + 1;
    }),
  );
}

{
  const syncEntrypoint = Effect.runSync(Effect.succeed(1));
}

{
  const exitEntrypoint = Effect.runSyncExit(Effect.succeed(1));
}

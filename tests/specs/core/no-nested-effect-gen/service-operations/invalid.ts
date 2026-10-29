import { Effect } from "effect";

{
  const yieldedGenerator = Effect.gen(function* () {
    return yield* Effect.gen(function* () {
      return 1;
    });
  });
}

{
  const localGeneratorStep = Effect.gen(function* () {
    const fragment = Effect.gen(function* () {
      return 1;
    });
    return yield* fragment;
  });
}

{
  const apiWithIntermediateGenerator = Effect.gen(function* () {
    const read = Effect.gen(function* () {
      const fragment = Effect.gen(function* () {
        return 1;
      });
      return yield* fragment;
    });
    return { read };
  });
}

{
  const apiWithShadowedRead = Effect.gen(function* () {
    const read = Effect.gen(function* () {
      const read = Effect.gen(function* () {
        return 1;
      });
      return yield* read;
    });
    return { read };
  });
}

{
  const nestedApiObject = Effect.gen(function* () {
    const read = Effect.gen(function* () {
      return 1;
    });
    return { nested: { read } };
  });
}

{
  const exposedGenerator = Effect.gen(function* () {
    const read = Effect.gen(function* () {
      return 1;
    });
    return { read };
  });
}

{
  const renamedGenerator = Effect.gen(function* () {
    const read = Effect.gen(function* () {
      return 1;
    });
    return { load: read };
  });
}

{
  const exposedFunction = Effect.gen(function* () {
    const read = Effect.fn("read")(function* () {
      return 1;
    });
    return { read };
  });
}

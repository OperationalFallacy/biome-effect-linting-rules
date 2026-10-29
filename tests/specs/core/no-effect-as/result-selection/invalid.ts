import { Effect, pipe } from "effect";

{
  const curriedResult = Effect.as(1);
}

{
  const dataFirstResult = Effect.as(task, 1);
}

{
  const genericResult = Effect.as<number>(1);
}

{
  const pipelineResult = Effect.void.pipe(Effect.as(1));
}

const mappedResult = Effect.void.pipe(Effect.map(() => 1));

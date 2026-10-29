import { Effect } from "effect";

const flatmapSequenceValue = Effect.succeed(1).pipe(
  Effect.flatMap((n) => Effect.succeed(n)),
  Effect.flatMap((m) => Effect.succeed(m)),
);

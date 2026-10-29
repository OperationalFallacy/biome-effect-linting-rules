import { Effect } from "effect";

const nestedFlatmapsValue = Effect.flatMap(Effect.succeed(1), (n) =>
  Effect.flatMap(Effect.succeed(n), (m) => Effect.succeed(m)),
);

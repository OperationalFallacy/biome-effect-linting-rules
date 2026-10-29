import { Effect, pipe } from "effect";

const nestedCombinatorsValue = Effect.map(
  Effect.map(Effect.succeed(1), (n) => n + 1),
  (n) => n * 2,
);

const orderedStepsValue = Effect.succeed(1).pipe(
  Effect.map((n) => n + 1),
  Effect.map((n) => n * 2),
);

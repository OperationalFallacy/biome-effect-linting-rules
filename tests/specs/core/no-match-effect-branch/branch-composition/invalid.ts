import { Effect, Match, pipe } from "effect";

const branchSequenceValue = Match.value(1).pipe(
  Match.when(1, () => Effect.succeed(1).pipe(Effect.map((n) => n + 1))),
  Match.orElse(() => Effect.succeed(0)),
);

const selectedValuesValue = Match.value(1).pipe(
  Match.when(1, () => 2),
  Match.orElse(() => 0),
);

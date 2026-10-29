import { Effect, Match, pipe } from "effect";

const emptyOperationValue = Match.value(true).pipe(
  Match.when(true, () => Effect.void),
  Match.orElse(() => task),
);

const domainChoicesValue = Match.value(true).pipe(
  Match.when(true, () => 1),
  Match.orElse(() => 0),
);

import { Effect, Match } from "effect";
export const label = Effect.succeed(true).pipe(Effect.map((enabled) => Match.value(enabled).pipe(Match.when(true, () => 1), Match.orElse(() => 0))));

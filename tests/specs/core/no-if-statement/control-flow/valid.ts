import { Effect, Match } from "effect";

const label = Match.value(enabled).pipe(
  Match.when(true, () => "Enabled"),
  Match.orElse(() => "Disabled"),
);

const writeWhen = Effect.fn("writeWhen")(function* (enabled: boolean) {
  if (enabled) {
    yield* writer.write;
  }
});

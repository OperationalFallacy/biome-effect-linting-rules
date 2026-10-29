import { Match, pipe, Schema } from "effect";

const manualBooleanInputValue = Match.value(input).pipe(
  Match.when(
    (n) => typeof n === "boolean",
    (n) => n,
  ),
  Match.orElse(() => null),
);

const decodedBooleanValue = Schema.decodeUnknownEffect(Schema.Boolean)(input);

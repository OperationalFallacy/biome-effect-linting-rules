import { Effect, Schema } from "effect";

const readName = Effect.fn("readName")(function* (input: unknown) {
  const user = yield* Schema.decodeUnknownEffect(User)(input);
  return user.name;
});

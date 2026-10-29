import { Effect } from "effect";

const loadProfile = Effect.fn("loadProfile")(function* () {
  const user = yield* readUser;
  return { id: user.id, name: user.name, email: user.email };
});

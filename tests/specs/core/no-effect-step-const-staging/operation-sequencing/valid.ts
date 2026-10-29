import { Effect } from "effect";

const loadProfile = Effect.fn("loadProfile")(function* () {
  const user = yield* readUser;
  const settings = yield* readSettings(user.id);
  return { user, settings };
});

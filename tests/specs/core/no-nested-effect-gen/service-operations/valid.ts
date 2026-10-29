import { Effect } from "effect";

const loadProfile = Effect.fn("loadProfile")(function* () {
  const user = yield* readUser;
  const profile = yield* readProfile(user.id);
  return { user, profile };
});

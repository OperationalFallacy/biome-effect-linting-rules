import { Effect } from "effect";

const saveProfile = Effect.fn("saveProfile")(function* () {
  const profile = yield* readProfile;
  yield* persistProfile(profile);
  yield* publishProfile(profile);
  return profile;
});

const independentReads = Effect.all({ profile: readProfile, settings: readSettings });

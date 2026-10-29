import { Effect } from "effect";

const profile = readProfile.pipe(
  Effect.catchTags({
    MissingProfile: () => defaultProfile,
    ProfileUnavailable: () => cachedProfile,
  }),
);

import { Effect } from "effect";

const loadProfile = readProfile.pipe(
  Effect.tap((profile) => Effect.logInfo("Profile loaded", { id: profile.id })),
);

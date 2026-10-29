import { Effect } from "effect";

const profile = readUser.pipe(
  Effect.flatMap((user) => readProfile(user.id)),
  Effect.map((profile) => profile.displayName),
);

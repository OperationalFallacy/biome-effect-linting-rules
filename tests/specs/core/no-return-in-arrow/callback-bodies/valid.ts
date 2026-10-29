import { Effect } from "effect";

const labels = rows.map((row) => row.name);

const normalized = rows.map((row) => {
  const name = row.name.trim();
  return name.toUpperCase();
});

const load = Effect.fn("load")(function* () {
  const profile = yield* readProfile;
  return profile.name;
});

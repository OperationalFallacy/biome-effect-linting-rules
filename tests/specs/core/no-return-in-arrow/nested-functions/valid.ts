import { Effect } from "effect";

const load = Effect.sync(() => {
  const read = Effect.fn("read")(function* () {
    const profile = yield* readProfile;
    return profile.name;
  });
  return { read };
});

const labels = rows.map((row) => {
  if (row.hidden) {
    return "Hidden";
  }
  return row.name;
});

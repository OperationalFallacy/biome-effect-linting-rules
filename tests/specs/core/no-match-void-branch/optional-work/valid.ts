import { Effect } from "effect";

const saveWhenEnabled = Effect.fn("saveWhenEnabled")(function* (enabled: boolean) {
  if (enabled) {
    yield* saveSettings;
  }
});

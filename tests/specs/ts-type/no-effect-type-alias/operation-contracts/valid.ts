import { Effect } from "effect";

const loadUser = Effect.fn("loadUser")(function* (id: string) {
  return yield* repository.findUser(id);
});

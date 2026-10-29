import { Effect, Layer } from "effect";

const loadUser = Effect.fn("loadUser")(function* () {
  const repository = yield* UserRepository;
  return yield* repository.findUser(id);
});

const liveLoad = loadUser().pipe(Effect.provide(UserRepository.layer));
const serviceLayer = Layer.effect(UserService, makeUserService).pipe(
  Layer.provide(UserRepository.layer),
);

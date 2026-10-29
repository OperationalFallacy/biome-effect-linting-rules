import { Context, Effect, Layer } from "effect";

class UserRepository extends Context.Service<UserRepository>()("UserRepository", {
  make: Effect.succeed({ findUser: readUser }),
}) {
  static readonly layer = Layer.effect(UserRepository, UserRepository.make).pipe(
    Layer.provide(Database.layer),
  );

  static createLayer = () => Layer.effect(this, this.make);

  read() {
    return this;
  }
}

class Widget {
  static readonly layer = Layer.effect(this, this.make);
}

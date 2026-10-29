import { Effect, pipe } from "effect";

function load() {
  try {
    return read();
  } catch (error) {
    return recover(error);
  }
}

const value = Effect.try({ try: read, catch: (cause) => cause }).pipe(
  Effect.catch(() => Effect.succeed(0)),
);

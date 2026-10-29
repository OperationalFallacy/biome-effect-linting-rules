import { Effect, pipe } from "effect";

declare const readSession: Effect.Effect<string>;

const loadSession = () =>
  pipe(
    readSession,
    Effect.map((session) => session.trim()),
  );

function loadSessionDirect() {
  return Effect.map(readSession, (session) => session.trim());
}

function intermediateApi() {
  const read = Effect.fn("read")(function* () {
    const fragment = () => Effect.succeed(1);
    return yield* fragment();
  });
  return { read };
}

function normalizeSession(session: string): string {
  return session.trim();
}

{
  function pipelineApi() {
    const read = pipe(
      Effect.succeed(1),
      Effect.map((n) => n + 1),
    );
    return { read };
  }
}

{
  function forwardedApi() {
    const read = () => Effect.succeed(1);
    return { read };
  }
}

{
  function parameterizedApi() {
    const read = (id: number) =>
      pipe(
        Effect.succeed(id),
        Effect.map((n) => n + 1),
      );
    return { read };
  }
}

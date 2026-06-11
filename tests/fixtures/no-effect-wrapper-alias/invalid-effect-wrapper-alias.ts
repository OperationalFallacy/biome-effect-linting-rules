import { Effect, pipe } from "effect";

declare const readSession: Effect.Effect<string>;

export const loadSession = () =>
  pipe(
    readSession,
    Effect.map((session) => session.trim()),
  );

export function loadSessionDirect() {
  return Effect.map(readSession, (session) => session.trim());
}

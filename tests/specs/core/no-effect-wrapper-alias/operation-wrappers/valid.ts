import { Effect, pipe } from "effect";

interface SessionStore {
  readonly read: Effect.Effect<string>;
}

/**
 * Correctly defines the complete named operation in one pipeline.
 * The Effect function supplies tracing without a forwarding fragment.
 */
export const loadSession = Effect.fn("loadSession")((store: SessionStore) =>
  store.read.pipe(Effect.map((session) => session.trim())),
);
export const fromForwarder = loadSession;

/**
 * Correctly keeps pure normalization as an ordinary function.
 */
export function normalizeSession(session: string) {
  return session.trim();
}

/**
 * Correctly exposes a complete query through the returned service API.
 */
export function pipelineApi() {
  const read = pipe(
    Effect.clockWith((clock) => clock.currentTimeMillis),
    Effect.map((time) => new Date(time).toISOString()),
  );
  return { read };
}

/**
 * Correctly exposes a callable query as a direct API operation.
 */
export function forwardedApi() {
  const read = () => Effect.clockWith((clock) => clock.currentTimeMillis);
  return { read };
}

/**
 * Correctly exposes a parameterized query that performs a complete transformation.
 */
export function parameterizedApi() {
  const read = (offset: number) =>
    pipe(
      Effect.clockWith((clock) => clock.currentTimeMillis),
      Effect.map((time) => new Date(time + offset).toISOString()),
    );
  return { read };
}

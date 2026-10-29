import { Effect, pipe } from "effect";

interface SessionStore {
  readonly read: Effect.Effect<string>;
}

/**
 * Incorrectly hides an intermediate Effect transformation behind a local function.
 * The complete operation must follow that wrapper to find its next step.
 */
export const loadSession = Effect.fn("loadSession")((store: SessionStore) => {
  const normalize = () => Effect.map(store.read, (session) => session.trim());
  return normalize();
});

/**
 * Questionably defines an Effect operation as a plain forwarding function.
 * A named Effect.fn operation can carry its identity and tracing with the work.
 */
function loadSessionDirect(store: SessionStore) {
  return Effect.map(store.read, (session) => session.trim());
}
export const fromForwarder = (store: SessionStore) => loadSessionDirect(store);

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

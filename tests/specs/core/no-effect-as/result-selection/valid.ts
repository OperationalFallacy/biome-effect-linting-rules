import { Effect, Schema } from "effect";

const task = Schema.decodeUnknownEffect(Schema.NonEmptyString)("Mira");

/**
 * Correctly uses Effect.map for explicit result-producing callbacks.
 * The transformation preserves failures from the preceding effect.
 */
export const completion = Effect.map(() => true);
export const complete = Effect.map(task, () => true);
export const genericCompletion = Effect.map<unknown, boolean>(() => true);
export const pipelineCompletion = task.pipe(Effect.map(() => true));
export const mappedCompletion = task.pipe(Effect.map(() => true));

import { Effect, Schema } from "effect";

const task = Schema.decodeUnknownEffect(Schema.NonEmptyString)("Mira");

/**
 * Questionably uses Effect.as for result selection. This package favors
 * explicit result-producing callbacks in composition.
 */
export const completion = Effect.as(true);
export const complete = Effect.as(task, true);
export const genericCompletion = Effect.as<boolean>(true);
export const pipelineCompletion = task.pipe(Effect.as(true));

/**
 * Correctly expresses result selection through an Effect.map callback.
 */
export const mappedCompletion = task.pipe(Effect.map(() => true));

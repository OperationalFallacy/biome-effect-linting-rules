import { Schema } from "effect";

const User = Schema.Struct({ id: Schema.String, active: Schema.Boolean });

/**
 * The User schema correctly keeps the expected structure and its validation
 * together. Schema.is supplies the synchronous isUser predicate.
 * The predicate still returns false for rejected input, so callers keep the
 * same boolean decision about whether the value describes a user.
 */
// It correctly derives the model predicate from its schema.
export const isUser = Schema.is(User);

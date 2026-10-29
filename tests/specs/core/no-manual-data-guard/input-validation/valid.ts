import { Schema } from "effect";

const User = Schema.Struct({ id: Schema.String, active: Schema.Boolean });

/**
 * Correctly decodes external data through the model schema. The operation
 * returns a validated value or a typed decoding failure.
 */
export const decodeUser = Schema.decodeUnknownEffect(User);

import { Schema } from "effect";

/**
 * Correctly decodes boolean input through Schema. Malformed input produces
 * a typed failure that callers can recover from through Effect composition.
 */
export const decodeEnabled = Schema.decodeUnknownEffect(Schema.Boolean);

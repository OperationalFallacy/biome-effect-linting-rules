import { Schema } from "effect";

const Profile = Schema.Struct({ id: Schema.String, name: Schema.String });

/**
 * Correctly decodes untrusted input through a schema. Invalid fields produce
 * a decoding failure before the operation can return a typed model.
 */
export const decodeProfile = Schema.decodeUnknownEffect(Profile);
export const decodeInlineProfile = Schema.decodeUnknownEffect(
  Schema.Struct({ id: Schema.String, name: Schema.String }),
);

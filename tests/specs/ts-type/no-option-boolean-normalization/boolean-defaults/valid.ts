import { Schema } from "effect";

const Settings = Schema.Struct({
  enabled: Schema.optionalKey(Schema.Boolean).pipe(
    Schema.withDecodingDefaultKey(() => false),
  ),
});
const decodeSettings = Schema.decodeUnknownEffect(Settings);

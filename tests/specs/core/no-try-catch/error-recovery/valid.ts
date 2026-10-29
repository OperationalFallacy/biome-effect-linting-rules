import { Effect, Schema } from "effect";

const readProfile = Schema.decodeUnknownEffect(Profile)(input).pipe(
  Effect.catchTag("SchemaError", () => readDefaultProfile),
);

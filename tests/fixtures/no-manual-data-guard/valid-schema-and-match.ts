import { Match, Schema } from "effect";

// Allowed: one Schema defines and decodes the external representation.
const ResourceFailureSchema = Schema.TaggedStruct("ResourceFailure", {
  code: Schema.String,
  message: Schema.String,
});

type ResourceFailure = typeof ResourceFailureSchema.Type;

const decodeResourceFailure = Schema.decodeUnknown(ResourceFailureSchema);

// Allowed: Match discriminates data that already has a decoded domain type.
const failureCode = (failure: ResourceFailure) =>
  Match.value(failure).pipe(
    Match.tag("ResourceFailure", ({ code }) => code),
    Match.exhaustive,
  );

export { decodeResourceFailure, failureCode };

import { Schema } from "effect";

interface ServiceManifest {
  readonly resources: Record<string, unknown>;
}

// Derailment: local shape predicates manufacture trusted model data without decoding it.
const isUnknownRecord = (
  input: unknown,
): input is Record<string, unknown> =>
  typeof input === "object" && input !== null;

const ServiceManifestSchema = Schema.declare(
  (input: unknown): input is ServiceManifest =>
    isUnknownRecord(input) && isUnknownRecord(input.resources),
);

export { ServiceManifestSchema };

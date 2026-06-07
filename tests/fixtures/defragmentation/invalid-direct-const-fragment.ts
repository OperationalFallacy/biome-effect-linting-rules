import { Data } from "effect";

type FailureKind = Data.TaggedEnum<{
  Transport: { readonly boundary: string };
}>;

// Proper usage: ADT constructor declarations are domain declarations, not
// assembly fragments, so this const is intentionally allowed.
const FailureKind = Data.taggedEnum<FailureKind>();

// Derailment: a standalone field fragment is later pulled into an object
// builder const. The contract shape is no longer local to the operation that
// emits it.
const errorFieldName = "errorMessage";

// Derailment: this module-level const function assembles its return object from
// the named fragment above. Keep the field choice in the same local operation
// block, or promote a real typed domain constructor.
const apiErrorObject = (error: { readonly message: string }) => ({
  field: errorFieldName,
  message: error.message,
});

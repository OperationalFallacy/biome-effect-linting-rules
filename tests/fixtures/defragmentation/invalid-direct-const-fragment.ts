import { Data } from "effect";

type FailureKind = Data.TaggedEnum<{
  Transport: { readonly boundary: string };
}>;

// Proper usage: ADT constructor declarations are domain declarations, not
// assembly fragments, so this const is intentionally allowed.
const FailureKind = Data.taggedEnum<FailureKind>();

// Derailment: this helper returns a partial object fragment rather than the
// final API error contract.
const apiErrorFields = (error: { readonly message: string }) => ({
  message: error.message,
});

// Derailment: the exported object builder assembles the final contract by
// spreading a helper-produced fragment.
const apiErrorObject = (error: { readonly message: string }) => ({
  errorType: "BoundaryFailure",
  ...apiErrorFields(error),
});

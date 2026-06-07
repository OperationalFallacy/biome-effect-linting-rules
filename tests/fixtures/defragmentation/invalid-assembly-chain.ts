import { Data, Option } from "effect";

type FailureKind = Data.TaggedEnum<{
  Transport: { readonly boundary: string };
}>;

// Proper usage: ADT constructor declarations are domain declarations, not
// assembly fragments, so this const is intentionally allowed.
const FailureKind = Data.taggedEnum<FailureKind>();

// Derailment level 1: a loose named fragment is extracted before there is a
// meaningful domain value.
const errorFieldName = "errorMessage";

// Derailment level 2: this helper const assembles a partial object from the
// loose fragment above. It is not a standalone domain concept; it is a staged
// piece of the final API error shape.
const apiErrorFields = (message: string) => ({
  [errorFieldName]: message,
});

// Derailment: the exported object builder now assembles the final contract from
// another assembly const and an inline transform. The reader has to chase the
// chain instead of seeing the API error contract in one operation-local block.
export const apiErrorObject = (error: { readonly message: string }) => ({
  ...apiErrorFields(error.message),
  stackTrace: Option.fromNullable(error.message).pipe(Option.map((value) => [value])),
});

import { Data, Schema as S } from "effect";

type BoundaryFailureCause = Data.TaggedEnum<{
  Transport: { readonly cause: unknown };
}>;

// Proper usage: ADT constructor declarations are domain declarations, not
// operation assembly fragments.
const BoundaryFailureCause = Data.taggedEnum<BoundaryFailureCause>();

// Proper usage: schema declarations define a reusable boundary contract. They
// are not staged helper pieces for one object assembly.
const BoundaryInputSchema = S.Struct({
  id: S.String,
});

type ApiErrorShape = {
  readonly errorData: string | undefined;
  readonly errorMessage: string;
  readonly errorType: string;
  readonly stackTrace: ReadonlyArray<string> | undefined;
};

// Proper usage: the helper has an explicit domain return type and binds the
// final contract-shaped value locally before returning it. It does not assemble
// the object from unrelated module-level fragments.
const apiErrorObject = (error: ApiErrorShape): ApiErrorShape => {
  const apiError: ApiErrorShape = {
    errorData: error.errorData,
    errorMessage: error.errorMessage,
    errorType: error.errorType,
    stackTrace: error.stackTrace,
  };

  return apiError;
};

export const decodeBoundaryInput = S.decodeUnknown(BoundaryInputSchema);
export const makeTransportFailure = BoundaryFailureCause.Transport;
export const mapApiError = apiErrorObject;

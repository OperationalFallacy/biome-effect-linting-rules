import { Data, Option, Schema } from "effect";

type directConstFragmentFailureKind = Data.TaggedEnum<{
  Transport: { readonly boundary: string };
}>;

const directConstFragmentFailureKind = Data.taggedEnum<directConstFragmentFailureKind>();

const directConstFragmentApiErrorFields = (error: { readonly message: string }) => ({
  message: error.message,
});

const directConstFragmentApiErrorObject = (error: { readonly message: string }) => ({
  errorType: "BoundaryFailure",
  ...directConstFragmentApiErrorFields(error),
});

const assemblyChainFailureKind = Data.taggedEnum<assemblyChainFailureKind>();

const assemblyChainApiErrorFields = (message: string) => ({
  errorMessage: message,
});

const assemblyChainApiErrorObject = (error: { readonly message: string }) => ({
  ...assemblyChainApiErrorFields(error.message),
  stackTrace: Option.fromNullishOr(error.message).pipe(Option.map((value) => [value])),
});

class BoundaryError extends Error {
  readonly reason: string;
  readonly cause: unknown;

  constructor(input: {
    readonly reason: string;
    readonly parameterName: string;
    readonly cause: unknown;
  }) {
    super(input.reason);
    this.reason = input.reason;
    this.cause = input.cause;
  }
}

const errorFields = (cause: unknown) => ({
  reason: "Failed to load config",
  cause,
});

const toBoundaryError = (parameterName: string, cause: unknown) =>
  new BoundaryError({
    parameterName,
    ...errorFields(cause),
  });

type Availability = Data.TaggedEnum<{
  InStock: { readonly copies: number };
  OnOrder: { readonly expected: string };
}>;

const Availability = Data.taggedEnum<Availability>();
const BookInput = Schema.Struct({ isbn: Schema.String, title: Schema.String });

type BookLabel = {
  readonly isbn: string;
  readonly text: string;
};

const bookLabel = (input: typeof BookInput.Type): BookLabel => {
  const label: BookLabel = {
    isbn: input.isbn,
    text: input.title.trim(),
  };
  return label;
};

const decodeBook = Schema.decodeUnknownEffect(BookInput);
const inStock = Availability.InStock;
const labelBook = bookLabel;

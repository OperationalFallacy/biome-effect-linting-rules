import { Data, Schema } from "effect";

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

// A complete return contract is not an object fragment.
const bookLabel = (input: typeof BookInput.Type): BookLabel => {
  const label: BookLabel = {
    isbn: input.isbn,
    text: input.title.trim(),
  };
  return label;
};

export const decodeBook = Schema.decodeUnknownEffect(BookInput);
export const inStock = Availability.InStock;
export const labelBook = bookLabel;

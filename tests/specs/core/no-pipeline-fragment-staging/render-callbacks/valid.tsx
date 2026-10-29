import { Match, Option } from "effect";
import { AsyncResult } from "effect/reactivity";

type Book = { readonly isbn: string };
type Search = AsyncResult.AsyncResult<
  { readonly books: readonly Book[] },
  Error
>;

/**
 * Correctly keeps local render values inside their result callback. The selected
 * branch returns a complete view without staging an intermediate pipe fragment.
 */
export function BookPanel(props: {
  readonly search: Search;
  readonly isbn: string;
}) {
  const content = AsyncResult.match(props.search, {
    onFailure: () => <div>Search failed</div>,
    onInitial: () => <div>Search pending</div>,
    onSuccess({ value }) {
      const book = Option.fromNullishOr(
        value.books.find((item) => item.isbn === props.isbn),
      );
      const missing = <div>No matching book</div>;
      return Option.match(book, {
        onNone: () =>
          Match.value(value.books.length).pipe(
            Match.when(0, () => <div>Empty catalog</div>),
            Match.orElse(() => missing),
          ),
        onSome: (item) => <div>{item.isbn}</div>,
      });
    },
  });
  return content;
}

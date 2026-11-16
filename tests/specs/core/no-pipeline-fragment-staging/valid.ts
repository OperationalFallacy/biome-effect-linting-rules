import { Option, pipe, Schema, String as Str } from "effect";

const BookCode = Schema.String.check(Schema.isPattern(/^[A-Za-z0-9-]+$/));
const QueryCode = Schema.Trim.pipe(
  Schema.check(Schema.isPattern(/^[A-Za-z0-9-]+$/)),
);

/**
 * resolveBookCode returns an uppercase book code. A valid trimmed query takes
 * precedence over the code in a /books/<code> path. The result is None when
 * both sources lack a valid code.
 * One pipeline keeps query decoding, fallback, and normalization together,
 * as the preset requires.
 */
export function resolveBookCode(query: unknown, path: string) {
  // It correctly completes the lookup in one pipeline.
  return pipe(
    query,
    Schema.decodeUnknownOption(QueryCode),
    Option.orElse(() =>
      Schema.decodeUnknownOption(BookCode)(
        path.match(/^\/books\/([A-Za-z0-9-]+)$/)?.[1],
      ),
    ),
    Option.map(Str.toUpperCase),
  );
}

/**
 * makeBookCodeOperations exposes separate query decoding and code formatting
 * operations. The decoder's local candidate and the formatter's candidate
 * parameter belong to different functions. The shared spelling does not split
 * a pipeline between their bodies.
 */
export function makeBookCodeOperations() {
  function decode(query: unknown) {
    // It correctly keeps this candidate within the decoder's scope.
    const candidate = pipe(query, Schema.decodeUnknownOption(QueryCode));

    return candidate;
  }

  function format(candidate: Option.Option<string>) {
    return pipe(candidate, Option.map(Str.toUpperCase));
  }

  return { decode, format };
}

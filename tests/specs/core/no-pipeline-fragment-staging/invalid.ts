import { Option, pipe, Schema, String as Str } from "effect";

const BookCode = Schema.String.check(Schema.isPattern(/^[A-Za-z0-9-]+$/));
const QueryCode = Schema.Trim.pipe(
  Schema.check(Schema.isPattern(/^[A-Za-z0-9-]+$/)),
);

/**
 * resolveBookCode returns an uppercase book code. A valid trimmed query takes
 * precedence over the code in a /books/<code> path. The result is None when
 * both sources lack a valid code.
 * The local fromQuery pipeline stops before fallback and normalization. The
 * preset requires those dependent steps in the same lookup pipeline.
 */
export function resolveBookCode(query: unknown, path: string) {
  // It incorrectly stages an unfinished lookup in fromQuery.
  const fromQuery = pipe(query, Schema.decodeUnknownOption(QueryCode));

  return pipe(
    fromQuery,
    Option.orElse(() =>
      Schema.decodeUnknownOption(BookCode)(
        path.match(/^\/books\/([A-Za-z0-9-]+)$/)?.[1],
      ),
    ),
    Option.map(Str.toUpperCase),
  );
}

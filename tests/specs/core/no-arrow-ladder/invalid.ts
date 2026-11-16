import { Effect, Schema } from "effect";
import { HttpClient, HttpClientResponse } from "effect/http";

const PageQuery = Schema.Struct({
  page: Schema.NumberFromString.check(
    Schema.isInt(),
    Schema.isGreaterThan(0),
  ).pipe(Schema.withDecodingDefaultKey(Effect.succeed("1"))),
  pageSize: Schema.NumberFromString.check(
    Schema.isInt(),
    Schema.isBetween({
      minimum: 1,
      maximum: 100,
    }),
  ).pipe(Schema.withDecodingDefaultKey(Effect.succeed("20"))),
});
const PageResult = Schema.Struct({
  items: Schema.Array(
    Schema.Struct({
      id: Schema.String,
      title: Schema.String,
    }),
  ),
  total: Schema.Int,
});

/**
 * The nested arrow calls incorrectly introduce separate scopes for the decoded
 * query and its offset. The reader must follow each invocation back to its
 * argument to connect the request parameters with the returned page range.
 */
export const loadPage = Effect.fn("Catalog.loadPage")(function* (
  queryParams: unknown,
  catalogUrl: string,
) {
  // These invoked arrows incorrectly split query decoding from offset and request construction.
  return yield* ((query: typeof PageQuery.Type) =>
    ((offset: number) =>
      HttpClient.get(catalogUrl, {
        urlParams: {
          offset,
          limit: query.pageSize,
        },
      }).pipe(
        Effect.flatMap(HttpClientResponse.filterStatusOk),
        Effect.flatMap(HttpClientResponse.schemaBodyJson(PageResult)),
        Effect.map((result) => ({
          items: result.items,
          total: result.total,
          offset,
          limit: query.pageSize,
        })),
      ))((query.page - 1) * query.pageSize))(
    yield* Schema.decodeUnknownEffect(PageQuery)(queryParams),
  );
});

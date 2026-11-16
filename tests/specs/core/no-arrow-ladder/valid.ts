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
 * The local query and offset correctly expose the values used by the request
 * and its result. Both remain in the generator's scope, so the page range can
 * be followed without tracing immediately invoked callbacks.
 */
export const loadPage = Effect.fn("Catalog.loadPage")(function* (
  queryParams: unknown,
  catalogUrl: string,
) {
  // Local query and offset values correctly keep the request parameters in this operation.
  const query = yield* Schema.decodeUnknownEffect(PageQuery)(queryParams);
  const offset = (query.page - 1) * query.pageSize;
  return yield* HttpClient.get(catalogUrl, {
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
  );
});

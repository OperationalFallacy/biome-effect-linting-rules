import { Option, pipe } from "effect";

// Derailment: query and path extraction are staged as local pipeline fragments,
// then the returned pipeline consumes those fragments to assemble the final
// route symbol flow.
export const resolveRouteSymbol = (
  querySymbol: string | readonly string[] | undefined,
  asPath: string,
): Option.Option<string> => {
  const symbolFromQuery = pipe(
    Option.fromNullable(querySymbol),
    Option.filter((value): value is string => typeof value === "string"),
  );
  const symbolFromPath = pipe(
    Option.fromNullable(asPath.split("?")[0]),
    Option.flatMap((path) =>
      Option.fromNullable(path.match(/^\/securities\/([^/]+)$/)?.[1]),
    ),
  );

  return pipe(
    symbolFromQuery,
    Option.orElse(() => symbolFromPath),
    Option.map((value) => decodeURIComponent(value).toUpperCase()),
  );
};

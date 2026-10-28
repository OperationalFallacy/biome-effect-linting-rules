import { Option, pipe } from "effect";

// Derailment: query and path extraction are staged as local pipeline fragments,
// then the returned pipeline consumes those fragments to assemble the final
// route symbol flow.
export const resolveBookSlug = (
  querySlug: string | readonly string[] | undefined,
  asPath: string,
): Option.Option<string> => {
  const symbolFromQuery = pipe(
    Option.fromNullishOr(querySlug),
    Option.filter((value): value is string => typeof value === "string"),
  );
  const symbolFromPath = pipe(
    Option.fromNullishOr(asPath.split("?")[0]),
    Option.flatMap((path) =>
      Option.fromNullishOr(path.match(/^\/books\/([^/]+)$/)?.[1]),
    ),
  );

  return pipe(
    symbolFromQuery,
    Option.orElse(() => symbolFromPath),
    Option.map((value) => decodeURIComponent(value).toUpperCase()),
  );
};

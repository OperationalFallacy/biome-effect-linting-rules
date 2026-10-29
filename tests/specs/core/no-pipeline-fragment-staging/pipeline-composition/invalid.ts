import { Option, pipe } from "effect";

const pipelineFragmentReturnResolveBookSlug = (
  querySlug: string | readonly string[] | undefined,
  asPath: string,
): Option.Option<string> => {
  const symbolFromQuery = pipe(
    Option.fromNullishOr(querySlug),
    Option.filter((value): value is string => typeof value === "string"),
  );
  const symbolFromPath = pipe(
    Option.fromNullishOr(asPath.split("?")[0]),
    Option.flatMap((path) => Option.fromNullishOr(path.match(/^\/books\/([^/]+)$/)?.[1])),
  );

  return pipe(
    symbolFromQuery,
    Option.orElse(() => symbolFromPath),
    Option.map((value) => decodeURIComponent(value).toUpperCase()),
  );
};

function pipelineFragmentLoad() {
  const staged = pipe(input, Option.fromNullishOr);
  return pipe(
    staged,
    Option.map((n) => n),
  );
}

function completePipelineLoad() {
  return pipe(
    input,
    Option.fromNullishOr,
    Option.map((n) => n),
  );
}

type RouteParts = {
  readonly path: string;
  readonly query: string | readonly string[] | undefined;
};

const routeParts = (
  querySlug: string | readonly string[] | undefined,
  asPath: string,
): RouteParts => ({
  path: asPath.split("?")[0] ?? "",
  query: querySlug,
});

const pipelineFinalDomainValueResolveBookSlug = (
  querySlug: string | readonly string[] | undefined,
  asPath: string,
): Option.Option<string> =>
  pipe(
    Option.fromNullishOr(routeParts(querySlug, asPath).query),
    Option.filter((value): value is string => typeof value === "string"),
    Option.map((value) => decodeURIComponent(value).toUpperCase()),
  );

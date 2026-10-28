import { Option, pipe } from "effect";

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

// Proper usage: the returned pipeline stays continuous and does not consume a
// locally staged pipeline fragment.
export const resolveBookSlug = (
  querySlug: string | readonly string[] | undefined,
  asPath: string,
): Option.Option<string> =>
  pipe(
    Option.fromNullishOr(routeParts(querySlug, asPath).query),
    Option.filter((value): value is string => typeof value === "string"),
    Option.map((value) => decodeURIComponent(value).toUpperCase()),
  );

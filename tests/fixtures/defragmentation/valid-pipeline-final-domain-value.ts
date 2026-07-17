import { Option, pipe } from "effect";

type RouteParts = {
  readonly path: string;
  readonly query: string | readonly string[] | undefined;
};

const routeParts = (
  querySymbol: string | readonly string[] | undefined,
  asPath: string,
): RouteParts => ({
  path: asPath.split("?")[0] ?? "",
  query: querySymbol,
});

// Proper usage: the returned pipeline stays continuous and does not consume a
// locally staged pipeline fragment.
export const resolveRouteSymbol = (
  querySymbol: string | readonly string[] | undefined,
  asPath: string,
): Option.Option<string> =>
  pipe(
    Option.fromNullable(routeParts(querySymbol, asPath).query),
    Option.filter((value): value is string => typeof value === "string"),
    Option.map((value) => decodeURIComponent(value).toUpperCase()),
  );

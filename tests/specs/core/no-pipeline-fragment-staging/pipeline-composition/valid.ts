import { Option, pipe } from "effect";

type QueryCode = string | ReadonlyArray<string> | undefined;

/**
 * Correctly composes the producer, fallback, and normalization in one pipeline.
 * The query takes precedence and the path is inspected only when needed.
 */
export const resolveBookCode = (query: QueryCode, path: string) =>
  pipe(
    Option.fromNullishOr(query),
    Option.filter((value): value is string => typeof value === "string"),
    Option.orElse(() =>
      Option.fromNullishOr(path.match(/^\/books\/([A-Za-z0-9-]+)$/)?.[1]),
    ),
    Option.map((code) => code.trim().toUpperCase()),
  );

/**
 * Correctly continues normalization from the optional input in one pipeline.
 */
export const readCode = (input: string | undefined) =>
  pipe(
    input,
    Option.fromNullishOr,
    Option.map((code) => code.trim().toUpperCase()),
  );

/**
 * Correctly extracts a complete route representation as a domain value.
 */
export const routeParts = (query: QueryCode, path: string) => ({ query, path });

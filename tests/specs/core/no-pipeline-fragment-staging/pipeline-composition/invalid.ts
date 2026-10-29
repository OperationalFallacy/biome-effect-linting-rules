import { Option, pipe } from "effect";

type QueryCode = string | ReadonlyArray<string> | undefined;

/**
 * Incorrectly stages the producer before its returned pipeline. The caller's
 * selection and normalization are split across declarations in one operation.
 */
export function resolveBookCode(query: QueryCode, path: string) {
  const fromQuery = pipe(
    Option.fromNullishOr(query),
    Option.filter((value): value is string => typeof value === "string"),
  );
  return pipe(
    fromQuery,
    Option.orElse(() =>
      Option.fromNullishOr(path.match(/^\/books\/([A-Za-z0-9-]+)$/)?.[1]),
    ),
    Option.map((code) => code.trim().toUpperCase()),
  );
}

/**
 * Incorrectly stages an optional input before its normalization pipeline.
 */
export function readCode(input: string | undefined) {
  const candidate = pipe(input, Option.fromNullishOr);
  return pipe(
    candidate,
    Option.map((code) => code.trim().toUpperCase()),
  );
}

/**
 * Correctly extracts a complete route representation as a domain value.
 */
export const routeParts = (query: QueryCode, path: string) => ({ query, path });
